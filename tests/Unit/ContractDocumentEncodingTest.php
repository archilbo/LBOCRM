<?php

namespace Tests\Unit;

use App\Services\ContractDocumentGenerator;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use ZipArchive;

class ContractDocumentEncodingTest extends TestCase
{
    private string $tempDir;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tempDir = sys_get_temp_dir().'/archi-docx-test-'.uniqid();
        mkdir($this->tempDir, 0777, true);
    }

    protected function tearDown(): void
    {
        if (is_dir($this->tempDir)) {
            $this->rmdirRecursive($this->tempDir);
        }
        parent::tearDown();
    }

    #[Test]
    public function it_does_not_double_encode_entities_in_docx_xml(): void
    {
        $docxPath = $this->createMinimalDocxWithPlaceholders();

        $generator = new ContractDocumentGenerator;

        $values = [
            'CLIENT_NAME' => 'D&amp;apos;UN',

            'CLIENT_ADDRESS' => 'Façade &amp; propriété &lt; 100 m²',

            'PROJECT_OBJECT' => 'L&apos;œuvre – العربية',

            'PROJECT_DESCRIPTION' => 'ÉTUDE D’ARCHITECTURE · M. &amp; Mme',
        ];

        $this->invokeReplaceSquarePlaceholders($generator, $docxPath, $values);

        $parsed = $this->parseDocxVisibleText($docxPath);

        $this->assertStringContainsString("D'UN", $parsed);
        $this->assertStringContainsString('Façade & propriété < 100 m²', $parsed);
        $this->assertStringContainsString("L'œuvre – العربية", $parsed);
        $this->assertStringContainsString('ÉTUDE D’ARCHITECTURE · M. & Mme', $parsed);

        $this->assertStringNotContainsString('&apos;', $parsed);
        $this->assertStringNotContainsString('&amp;apos;', $parsed);
        $this->assertStringNotContainsString('&#039;', $parsed);
        $this->assertStringNotContainsString('&amp;#039;', $parsed);

        $rawXml = $this->getDocxXml($docxPath, 'word/document.xml');

        $this->assertStringContainsString('&amp;', $rawXml, 'XML should contain valid single-escaped ampersands');
        $this->assertStringContainsString('&lt;', $rawXml, 'XML should contain valid single-escaped angle brackets');

        // Verify no double escaping
        $this->assertStringNotContainsString('&amp;amp;', $rawXml);
        $this->assertStringNotContainsString('&amp;apos;', $rawXml);
        $this->assertStringNotContainsString('&amp;#039;', $rawXml);

        // Verify XML is valid
        $dom = new \DOMDocument;
        $result = $dom->loadXML($rawXml, LIBXML_NOERROR);
        $this->assertTrue($result, 'Generated DOCX XML must be valid XML');
    }

    #[Test]
    public function it_preserves_all_french_characters_through_docx_pipeline(): void
    {
        $docxPath = $this->createMinimalDocxWithPlaceholders();

        $generator = new ContractDocumentGenerator;

        $values = [
            'CLIENT_NAME' => "CONTRAT D'ARCHITECTURE – M. & Mme Saïdi",

            'CLIENT_ADDRESS' => 'Façade principale · 150 m² habitable « R+2 »',

            'PROJECT_OBJECT' => "ÉTUDE D'ARCHITECTURE D'UN PROJET DE CONSTRUCTION",

            'PROJECT_DESCRIPTION' => implode(' | ', [
                "L'œuvre architecturale contemporaine",
                "Bâtiment à usage d'habitation",
                'Règlement de voirie – lot N° 47',
                "À côté de l'école primaire",
                'Surface < 200 m² (VEFA)',
                'Français, العربية, English',
            ]),

            'ADDITIONAL_A' => 'é è ê ë É È Ê Ë',
            'ADDITIONAL_B' => 'à â ä À Â Ä',
            'ADDITIONAL_C' => 'ù û ü Ù Û Ü',
            'ADDITIONAL_D' => 'ô ö Ô Ö',
            'ADDITIONAL_E' => 'î ï Î Ï',
            'ADDITIONAL_F' => 'ç Ç œ Œ',
            'ADDITIONAL_G' => '« » — – ° N°',
            'ADDITIONAL_H' => 'Prix : 1 500 000,00 € TVA 20%',
        ];

        $this->invokeReplaceSquarePlaceholders($generator, $docxPath, $values);

        $parsed = $this->parseDocxVisibleText($docxPath);

        // Verify each value appears correctly in the output
        foreach ($values as $key => $expected) {
            $this->assertStringContainsString(
                $expected,
                $parsed,
                "Value for [{$key}] not found correctly in DOCX output"
            );
        }

        // Verify French characters are present in parsed text
        $this->assertStringContainsString('é', $parsed, 'Missing é in DOCX output');
        $this->assertStringContainsString('è', $parsed, 'Missing è in DOCX output');
        $this->assertStringContainsString('ê', $parsed, 'Missing ê in DOCX output');
        $this->assertStringContainsString('ë', $parsed, 'Missing ë in DOCX output');
        $this->assertStringContainsString('É', $parsed, 'Missing É in DOCX output');
        $this->assertStringContainsString('à', $parsed, 'Missing à in DOCX output');
        $this->assertStringContainsString('â', $parsed, 'Missing â in DOCX output');
        $this->assertStringContainsString('ä', $parsed, 'Missing ä in DOCX output');
        $this->assertStringContainsString('ù', $parsed, 'Missing ù in DOCX output');
        $this->assertStringContainsString('û', $parsed, 'Missing û in DOCX output');
        $this->assertStringContainsString('ô', $parsed, 'Missing ô in DOCX output');
        $this->assertStringContainsString('ö', $parsed, 'Missing ö in DOCX output');
        $this->assertStringContainsString('î', $parsed, 'Missing î in DOCX output');
        $this->assertStringContainsString('ï', $parsed, 'Missing ï in DOCX output');
        $this->assertStringContainsString('ç', $parsed, 'Missing ç in DOCX output');
        $this->assertStringContainsString('Ç', $parsed, 'Missing Ç in DOCX output');
        $this->assertStringContainsString('œ', $parsed, 'Missing œ in DOCX output');
        $this->assertStringContainsString('Œ', $parsed, 'Missing Œ in DOCX output');
        $this->assertStringContainsString('«', $parsed, 'Missing « in DOCX output');
        $this->assertStringContainsString('»', $parsed, 'Missing » in DOCX output');
        $this->assertStringContainsString('–', $parsed, 'Missing en-dash in DOCX output');
        $this->assertStringContainsString('—', $parsed, 'Missing em-dash in DOCX output');
        $this->assertStringContainsString('°', $parsed, 'Missing degree in DOCX output');
        $this->assertStringContainsString('€', $parsed, 'Missing € in DOCX output');
        $this->assertStringContainsString('&', $parsed, 'Missing & in DOCX output');
        $this->assertStringContainsString('<', $parsed, 'Missing < in DOCX output');
        $this->assertStringContainsString('العربية', $parsed, 'Missing Arabic in DOCX output');

        // Verify no encoded entities in visible text
        $this->assertStringNotContainsString('&amp;', $parsed, 'Visible text contains double-escaped ampersand');
        $this->assertStringNotContainsString('&lt;', $parsed, 'Visible text contains double-escaped angle bracket');
        $this->assertStringNotContainsString('&apos;', $parsed, 'Visible text contains &apos;');
        $this->assertStringNotContainsString('&#039;', $parsed, 'Visible text contains &#039;');
        $this->assertStringNotContainsString('&eacute;', $parsed, 'Visible text contains &eacute;');
        $this->assertStringNotContainsString('&egrave;', $parsed, 'Visible text contains &egrave;');
        $this->assertStringNotContainsString('&ccedil;', $parsed, 'Visible text contains &ccedil;');
        $this->assertStringNotContainsString('&agrave;', $parsed, 'Visible text contains &agrave;');

        // Verify raw XML is valid
        $rawXml = $this->getDocxXml($docxPath, 'word/document.xml');
        $dom = new \DOMDocument;
        $this->assertTrue($dom->loadXML($rawXml, LIBXML_NOERROR), 'DOCX XML must be valid');

        // Verify no double-escaping in raw XML
        $this->assertStringNotContainsString('&amp;amp;', $rawXml, 'Raw XML contains double-escaped ampersand');
        $this->assertStringNotContainsString('&amp;apos;', $rawXml, 'Raw XML contains double-escaped apostrophe');
        $this->assertStringNotContainsString('&amp;lt;', $rawXml, 'Raw XML contains double-escaped lt');
        $this->assertStringNotContainsString('&amp;gt;', $rawXml, 'Raw XML contains double-escaped gt');

        // Verify raw XML has proper single-escaped entities
        $this->assertStringContainsString('&amp;', $rawXml, 'Raw XML must have single-escaped ampersand');
        $this->assertStringContainsString('&lt;', $rawXml, 'Raw XML must have single-escaped lt');
    }

    #[Test]
    public function it_handles_legacy_entity_values_through_docx_pipeline(): void
    {
        $docxPath = $this->createMinimalDocxWithPlaceholders();

        $generator = new ContractDocumentGenerator;

        // Simulate database values that contain legacy HTML entities
        $values = [
            'CLIENT_NAME' => 'D&amp;apos;UN',
            'CLIENT_ADDRESS' => 'Façade &amp; propriété &lt; 100 m²',
            'PROJECT_OBJECT' => 'L&apos;œuvre – العربية &amp; English',
            'PROJECT_DESCRIPTION' => 'ÉTUDE D&apos;ARCHITECTURE · M. &amp; Mme&eacute;l&egrave;ve',
        ];

        $this->invokeReplaceSquarePlaceholders($generator, $docxPath, $values);

        $parsed = $this->parseDocxVisibleText($docxPath);

        // Verify entity values are decoded in output
        $this->assertStringContainsString("D'UN", $parsed);
        $this->assertStringContainsString('Façade & propriété < 100 m²', $parsed);
        $this->assertStringContainsString("L'œuvre – العربية & English", $parsed);
        $this->assertStringContainsString("ÉTUDE D'ARCHITECTURE · M. & Mmeélève", $parsed);

        // Verify no visible entities remain
        $this->assertStringNotContainsString('&amp;', $parsed);
        $this->assertStringNotContainsString('&apos;', $parsed);
        $this->assertStringNotContainsString('&lt;', $parsed);
        $this->assertStringNotContainsString('&eacute;', $parsed);
        $this->assertStringNotContainsString('&egrave;', $parsed);

        // Verify raw XML is valid
        $rawXml = $this->getDocxXml($docxPath, 'word/document.xml');
        $dom = new \DOMDocument;
        $this->assertTrue($dom->loadXML($rawXml, LIBXML_NOERROR), 'DOCX XML must be valid');

        // Verify no double escaping
        $this->assertStringNotContainsString('&amp;amp;', $rawXml);
        $this->assertStringNotContainsString('&amp;apos;', $rawXml);
        $this->assertStringNotContainsString('&amp;lt;', $rawXml);
    }

    private function createMinimalDocxWithPlaceholders(): string
    {
        $path = $this->tempDir.'/test-template.docx';

        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::CREATE);

        // [Content_Types].xml
        $zip->addFromString('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>');

        // _rels/.rels
        $zip->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>');

        // word/_rels/document.xml.rels
        $zip->addFromString('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>');

        // word/document.xml with placeholders
        $zip->addFromString('word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>[CLIENT_NAME]</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>[CLIENT_ADDRESS]</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>[PROJECT_OBJECT]</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>[PROJECT_DESCRIPTION]</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>[ADDITIONAL_A]</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>[ADDITIONAL_B]</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>[ADDITIONAL_C]</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>[ADDITIONAL_D]</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>[ADDITIONAL_E]</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>[ADDITIONAL_F]</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>[ADDITIONAL_G]</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>[ADDITIONAL_H]</w:t></w:r>
    </w:p>
  </w:body>
</w:document>');

        $zip->close();

        return $path;
    }

    private function invokeReplaceSquarePlaceholders(
        ContractDocumentGenerator $generator,
        string $docxPath,
        array $values
    ): void {
        $reflection = new \ReflectionClass($generator);
        $method = $reflection->getMethod('replaceSquarePlaceholdersInDocx');
        $method->setAccessible(true);
        $method->invoke($generator, $docxPath, $values);
    }

    private function parseDocxVisibleText(string $docxPath): string
    {
        $xml = $this->getDocxXml($docxPath, 'word/document.xml');

        $dom = new \DOMDocument;
        $dom->loadXML($xml, LIBXML_NOERROR);
        $xpath = new \DOMXPath($dom);
        $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

        $parts = [];
        foreach ($xpath->query('//w:t') as $t) {
            $parts[] = $t->textContent;
        }

        return implode("\n", $parts);
    }

    private function getDocxXml(string $docxPath, string $internalPath): string
    {
        $zip = new ZipArchive;
        $zip->open($docxPath);
        $xml = $zip->getFromName($internalPath);
        $zip->close();

        return $xml;
    }

    private function rmdirRecursive(string $dir): void
    {
        $items = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($items as $item) {
            if ($item->isDir()) {
                rmdir($item->getPathname());
            } else {
                unlink($item->getPathname());
            }
        }

        rmdir($dir);
    }
}
