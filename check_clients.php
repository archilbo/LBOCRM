<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

$clients = App\Models\Client::with(['dossiers' => function ($q) { $q->with('contract')->orderByDesc('created_at'); }])->orderBy('full_name')->get();
foreach ($clients as $c) {
    echo $c->full_name . ' (' . $c->id . '): ' . $c->dossiers->count() . ' dossiers' . PHP_EOL;
    foreach ($c->dossiers as $d) {
        echo '  - ' . $d->dossier_number . ' ' . $d->project_object . PHP_EOL;
    }
}