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
        $this->tempDir = sys_get_temp_dir() . '/archi-docx-test-' . uniqid();
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

        $generator = new ContractDocumentGenerator();

        $values = [
            'CLIENT_NAME' => 'D&amp;apos;UN',

            'CLIENT_ADDRESS' =>
                'Façade &amp; propriété &lt; 100 m²',

            'PROJECT_OBJECT' =>
                "L&apos;œuvre – العربية",

            'PROJECT_DESCRIPTION' =>
                'ÉTUDE D’ARCHITECTURE · M. &amp; Mme',
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
        $dom = new \DOMDocument();
        $result = $dom->loadXML($rawXml, LIBXML_NOERROR);
        $this->assertTrue($result, 'Generated DOCX XML must be valid XML');
    }

    private function createMinimalDocxWithPlaceholders(): string
    {
        $path = $this->tempDir . '/test-template.docx';

        $zip = new ZipArchive();
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

        $dom = new \DOMDocument();
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
        $zip = new ZipArchive();
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
