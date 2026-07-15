$doc = App\Models\FinanceDocument::with(['items', 'payments', 'client', 'dossier', 'template', 'creator'])->find(11);

if (!$doc) {
    echo "DOC 11 NOT FOUND\n";
    return;
}

$resource = new App\Http\Resources\FinanceDocumentResource($doc);
$data = $resource->toArray(new Illuminate\Http\Request);

echo "KEYS: " . implode(', ', array_keys($data)) . "\n";
echo "type: " . ($data['type'] ?? 'MISSING') . "\n";
echo "number: " . ($data['number'] ?? 'MISSING') . "\n";
echo "status: " . ($data['status'] ?? 'MISSING') . "\n";
echo "items count: " . count($data['items'] ?? []) . "\n";
echo "client: " . ($data['client']['name'] ?? 'MISSING') . "\n";
echo "dossier: " . ($data['dossier']['number'] ?? 'MISSING') . "\n";
echo "totalTtc: " . ($data['totalTtc'] ?? 'MISSING') . "\n";
echo "payments count: " . count($data['payments'] ?? []) . "\n";
echo "showUrl: " . ($data['showUrl'] ?? 'MISSING') . "\n";
