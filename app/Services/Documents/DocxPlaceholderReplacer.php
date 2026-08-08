<?php

namespace App\Services\Documents;

use App\Support\UnicodeText;
use DOMDocument;
use DOMElement;
use DOMNode;
use DOMXPath;
use RuntimeException;
use ZipArchive;

/**
 * The ONE safe DOCX placeholder engine shared by every document generator
 * (Contract, Fiche efficacité, ...). Replaces [TOKEN] placeholders at the
 * run/text-node level only and NEVER alters the document structure:
 *
 *  - A token fully contained in a single <w:t> is replaced in place.
 *  - A token fragmented across adjacent pure-text runs (e.g. "[", "ENTREPRISE_",
 *    "CEO", "]") is merged into the FIRST run of its span only; the other
 *    fragment <w:t> nodes of the span are removed while their (empty) runs
 *    stay, so every run keeps its formatting (rPr) and position.
 *  - A span containing non-text content (drawings, breaks, tabs, hyperlinks)
 *    is refused with a RuntimeException: an unresolvable placeholder must
 *    fail loudly instead of silently corrupting the document.
 *  - Paragraphs and parts without placeholders are left byte-for-byte
 *    untouched; only modified word/*.xml parts are rewritten into the zip.
 *
 * This replaces the legacy per-generator pipeline (TemplateProcessor plus a
 * paragraph-flattening XML pass) that collapsed every paragraph containing a
 * token into a single run and deleted all its sibling runs — corrupting
 * anchored textboxes and destroying field lines.
 */
final class DocxPlaceholderReplacer
{
    /**
     * Replace every known [TOKEN] inside the given DOCX (all word/*.xml parts).
     *
     * @param  array<string, string>  $values  [TOKEN => value]
     *
     * @throws RuntimeException when the DOCX cannot be opened or a fragmented
     *         placeholder spans non-text content
     */
    public function replace(string $docxPath, array $values): void
    {
        if ($values === []) {
            return;
        }

        // Clean values once, exactly like the legacy pipeline did.
        $search = [];
        foreach ($values as $key => $value) {
            $search['['.$key.']'] = UnicodeText::forDocument($value);
        }

        // Longest tokens first: a short key can never shadow a longer one.
        uksort($search, static fn (string $a, string $b): int => strlen($b) <=> strlen($a));

        $keys = array_keys($search);

        $zip = new ZipArchive;

        if ($zip->open($docxPath) !== true) {
            throw new RuntimeException('Impossible d\'ouvrir le fichier DOCX généré.');
        }

        for ($index = 0; $index < $zip->numFiles; $index++) {
            $name = $zip->getNameIndex($index);

            if (! $name || ! str_starts_with($name, 'word/') || ! str_ends_with($name, '.xml')) {
                continue;
            }

            $xml = $zip->getFromName($name);

            if ($xml === false) {
                continue;
            }

            $updated = $this->replacePart($xml, $keys, $search);

            if ($updated !== null) {
                $zip->addFromString($name, $updated);
            }
        }

        $zip->close();
    }

    /**
     * @param  list<string>  $keys
     * @param  array<string, string>  $search
     */
    private function replacePart(string $xml, array $keys, array $search): ?string
    {
        libxml_use_internal_errors(true);

        $dom = new DOMDocument;

        if (! $dom->loadXML($xml, LIBXML_PARSEHUGE)) {
            return null;
        }

        $xpath = new DOMXPath($dom);
        $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

        $changed = false;

        // Includes paragraphs nested inside textboxes (w:txbxContent), which
        // the legacy flattening pass wrongly treated as a single block.
        foreach ($xpath->query('//w:p') as $paragraph) {
            if ($this->replaceParagraph($paragraph, $xpath, $keys, $search)) {
                $changed = true;
            }
        }

        if (! $changed) {
            return null;
        }

        // Keep the original XML declaration byte-for-byte.
        $decl = '';

        if (str_starts_with($xml, '<?xml')) {
            $end = strpos($xml, '?>');

            if ($end !== false) {
                $decl = substr($xml, 0, $end + 2)."\n";
            }
        }

        return $decl.$dom->saveXML($dom->documentElement);
    }

    /**
     * @param  list<string>  $keys
     * @param  array<string, string>  $search
     */
    private function replaceParagraph(DOMElement $paragraph, DOMXPath $xpath, array $keys, array $search): bool
    {
        $textNodes = [];
        $lengths = [];
        $fullText = '';

        foreach ($xpath->query('.//w:t', $paragraph) as $node) {
            $textNodes[] = $node;
            $lengths[] = mb_strlen($node->textContent);
            $fullText .= $node->textContent;
        }

        if ($textNodes === []) {
            return false;
        }

        /** @var list<array{start: int, end: int, key: string}> $occurrences */
        $occurrences = [];

        foreach ($keys as $key) {
            $offset = 0;

            while (($pos = mb_strpos($fullText, $key, $offset)) !== false) {
                $occurrences[] = [
                    'start' => $pos,
                    'end' => $pos + mb_strlen($key),
                    'key' => $key,
                ];
                $offset = $pos + mb_strlen($key);
            }
        }

        if ($occurrences === []) {
            return false;
        }

        // Drop occurrences contained inside another one: a short key must
        // never match inside a longer placeholder (e.g. [MAIL] inside
        // [ENTREPRISE_MAIL]) — the longer token wins.
        usort(
            $occurrences,
            static fn (array $a, array $b): int => $a['start'] <=> $b['start'] ?: strlen($b['key']) <=> strlen($a['key'])
        );

        $filtered = [];
        $lastEnd = -1;

        foreach ($occurrences as $occurrence) {
            if ($occurrence['start'] < $lastEnd) {
                continue;
            }

            $filtered[] = $occurrence;
            $lastEnd = $occurrence['end'];
        }

        // Right-to-left: mutations never shift the spans still to process.
        usort($filtered, static fn (array $a, array $b): int => $b['start'] <=> $a['start']);

        $changed = false;

        foreach ($filtered as $occurrence) {
            $startNode = $this->nodeIndexAt($lengths, $occurrence['start']);
            $endNode = $this->nodeIndexAt($lengths, $occurrence['end'] - 1);

            if ($startNode === $endNode) {
                // Token fully inside one text node: position-free replace.
                $this->setNodeText($textNodes[$startNode], str_replace(
                    $occurrence['key'],
                    $search[$occurrence['key']],
                    $textNodes[$startNode]->textContent
                ));
                $changed = true;

                continue;
            }

            $spanNodes = array_slice($textNodes, $startNode, $endNode - $startNode + 1);

            $this->assertPureTextSpan($spanNodes, $occurrence['key']);

            $prefix = $this->prefixLength($lengths, $startNode);
            $localStart = $occurrence['start'] - $prefix;
            $localEnd = $occurrence['end'] - $prefix;

            $merged = '';
            foreach ($spanNodes as $node) {
                $merged .= $node->textContent;
            }

            // Nodes are processed right-to-left: content beyond the token may
            // already carry earlier replacements and is appended verbatim.
            $this->setNodeText($textNodes[$startNode],
                mb_substr($merged, 0, $localStart)
                .$search[$occurrence['key']]
                .mb_substr($merged, $localEnd)
            );

            // Remove the fragment <w:t> nodes only; their runs stay so the
            // run count and every rPr remain identical to the template.
            for ($i = $endNode; $i > $startNode; $i--) {
                $textNodes[$i]->parentNode?->removeChild($textNodes[$i]);
            }

            $changed = true;
        }

        return $changed;
    }

    /**
     * Smallest node index whose text covers the given character position.
     *
     * @param  list<int>  $lengths
     */
    private function nodeIndexAt(array $lengths, int $charIndex): int
    {
        $acc = 0;

        foreach ($lengths as $index => $length) {
            $acc += $length;

            if ($charIndex < $acc) {
                return $index;
            }
        }

        return count($lengths) - 1;
    }

    /**
     * @param  list<int>  $lengths
     */
    private function prefixLength(array $lengths, int $nodeIndex): int
    {
        $acc = 0;

        for ($i = 0; $i < $nodeIndex; $i++) {
            $acc += $lengths[$i];
        }

        return $acc;
    }

    /**
     * Replace a text node's content with raw text, escaping every markup
     * character. NEVER assign nodeValue directly: PHP's DOM parses the
     * assigned string as markup and values containing "&" or "<" silently
     * become empty nodes.
     */
    private function setNodeText(DOMNode $node, string $text): void
    {
        while ($node->firstChild !== null) {
            $node->removeChild($node->firstChild);
        }

        $node->appendChild($node->ownerDocument->createTextNode($text));
    }

    /**
     * A fragmented placeholder may only span pure-text runs: every node in
     * the span must live in a <w:r> whose only element children are <w:rPr>
     * and <w:t>. Anything else (drawings, breaks, tabs, hyperlinks) would be
     * corrupted by merging — refuse loudly instead.
     *
     * @param  list<DOMNode>  $spanNodes
     */
    private function assertPureTextSpan(array $spanNodes, string $key): void
    {
        foreach ($spanNodes as $node) {
            $parent = $node->parentNode;

            if (! $parent instanceof DOMElement || $parent->localName !== 'r') {
                throw new RuntimeException(
                    "Fiche ou contrat: le placeholder {$key} chevauche un contenu non textuel."
                );
            }

            foreach ($parent->childNodes as $child) {
                if (! $child instanceof DOMElement) {
                    continue;
                }

                if ($child->localName !== 'rPr' && $child->localName !== 't') {
                    throw new RuntimeException(
                        "Fiche ou contrat: le placeholder {$key} chevauche un contenu non textuel."
                    );
                }
            }
        }
    }
}
