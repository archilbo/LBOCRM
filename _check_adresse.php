<?php
$templates = [
    '0.5' => 'storage/app/private/archi-templates/contracts/contrat_architecte_0_5.docx',
    '2' => 'storage/app/private/archi-templates/contracts/contrat_architecte_2.docx',
];

foreach ($templates as $rate => $path) {
    echo "=== Template $rate ===\n";
    $zip = new ZipArchive();
    $zip->open($path);
    $allText = '';
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $name = $zip->getNameIndex($i);
        if (!$name || !str_ends_with($name, '.xml')) continue;
        $xml = $zip->getFromName($name);
        // Extract text between <w:t> tags
        preg_match_all('/<w:t[^>]*>([^<]+)<\/w:t>/', $xml, $m);
        $allText .= implode('', $m[1]) . "\n";
    }
    // Find lines around "Adresse"
    $lines = explode("\n", $allText);
    foreach ($lines as $i => $line) {
        if (str_contains($line, 'Adresse') || str_contains($line, 'adresse')) {
            echo "Line " . ($i+1) . ": " . trim($line) . "\n";
            if (isset($lines[$i+1])) echo "Next: " . trim($lines[$i+1]) . "\n";
            if (isset($lines[$i+2])) echo "Next2: " . trim($lines[$i+2]) . "\n";
        }
    }
    $zip->close();
    echo "\n";
}
