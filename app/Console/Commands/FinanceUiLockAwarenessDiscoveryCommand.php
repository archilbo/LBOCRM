<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FinanceUiLockAwarenessDiscoveryCommand extends Command
{
    protected $signature = 'archilbo:finance-ui-lock-awareness-discovery';

    protected $description = 'Discover React UI files that need locked finance document awareness.';

    public function handle(): int
    {
        $this->info('Finance UI lock awareness discovery started...');

        $roots = [
            'resources/js/features/finance',
            'resources/js/Features/Finance',
            'resources/js/pages/Finance',
            'resources/js/Pages/Finance',
            'resources/js/Pages/Admin/Finance',
            'resources/js/pages/Admin/Finance',
        ];

        $keywords = [
            'FinanceDocument',
            'number',
            'type',
            'issue',
            'date',
            'edit',
            'update',
            'drawer',
            'form',
            'generate',
            'pdf',
            'excel',
            'download',
            'document',
            'status',
        ];

        $alreadyAware = [
            'numberLocked',
            'numberLockedAt',
            'isLocked',
            'canEditNumberFields',
            'canRegenerateExports',
            'lockedAtFormatted',
        ];

        $rows = [];
        $report = [
            '# Finance UI Lock Awareness Discovery',
            '',
            'Generated at: '.now()->toDateTimeString(),
            '',
            '## Backend payload keys available',
            '',
            '```ts',
            'document.numberLocked',
            'document.numberLockedAt',
            'document.lock.isLocked',
            'document.lock.lockedAtFormatted',
            'document.lock.message',
            'document.lock.blockedFields',
            'document.lock.canEditNumberFields',
            'document.lock.canRegenerateExports',
            'document.lock.canGeneratePdf',
            'document.lock.canGenerateExcel',
            '```',
            '',
            '## Candidates',
            '',
        ];

        foreach ($roots as $root) {
            $directory = base_path($root);

            if (! is_dir($directory)) {
                continue;
            }

            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($directory, \FilesystemIterator::SKIP_DOTS)
            );

            foreach ($iterator as $file) {
                if (! $file->isFile()) {
                    continue;
                }

                $extension = strtolower($file->getExtension());

                if (! in_array($extension, ['ts', 'tsx', 'js', 'jsx'], true)) {
                    continue;
                }

                $path = $file->getPathname();
                $relativePath = str_replace(base_path().DIRECTORY_SEPARATOR, '', $path);
                $relativePath = str_replace('\\', '/', $relativePath);
                $content = file_get_contents($path);

                if (! is_string($content) || trim($content) === '') {
                    continue;
                }

                $score = 0;

                foreach ($keywords as $keyword) {
                    if (str_contains(strtolower($content), strtolower($keyword)) || str_contains(strtolower($relativePath), strtolower($keyword))) {
                        $score++;
                    }
                }

                if ($score < 3) {
                    continue;
                }

                $aware = false;

                foreach ($alreadyAware as $needle) {
                    if (str_contains($content, $needle)) {
                        $aware = true;
                        break;
                    }
                }

                $type = $this->guessType($relativePath, $content);

                $rows[] = [
                    'score' => $score,
                    'type' => $type,
                    'aware' => $aware ? 'yes' : 'no',
                    'path' => $relativePath,
                ];
            }
        }

        usort($rows, fn (array $a, array $b): int => $b['score'] <=> $a['score']);

        foreach ($rows as $index => $row) {
            $report[] = '### '.($index + 1).'. '.$row['path'];
            $report[] = '';
            $report[] = '- Score: '.$row['score'];
            $report[] = '- Type: '.$row['type'];
            $report[] = '- Already lock-aware: '.$row['aware'];
            $report[] = '';
        }

        if (! is_dir(base_path('docs'))) {
            mkdir(base_path('docs'), 0777, true);
        }

        file_put_contents(base_path('docs/finance-ui-lock-awareness-discovery.md'), implode(PHP_EOL, $report).PHP_EOL);

        $this->table(
            ['Score', 'Type', 'Aware', 'Path'],
            array_map(fn (array $row): array => [
                $row['score'],
                $row['type'],
                $row['aware'],
                $row['path'],
            ], array_slice($rows, 0, 40))
        );

        $this->info('Report written: docs/finance-ui-lock-awareness-discovery.md');
        $this->info('Finance UI lock awareness discovery completed.');

        return self::SUCCESS;
    }

    protected function guessType(string $path, string $content): string
    {
        $source = strtolower($path.' '.$content);

        if (str_contains($source, 'types')) {
            return 'Types';
        }

        if (str_contains($source, 'drawer') || str_contains($source, 'form')) {
            return 'Drawer/Form';
        }

        if (str_contains($source, 'actions') || str_contains($source, 'button')) {
            return 'Actions';
        }

        if (str_contains($source, 'preview')) {
            return 'Preview';
        }

        if (str_contains($source, 'show')) {
            return 'Page/Show';
        }

        if (str_contains($source, 'index') || str_contains($source, 'table') || str_contains($source, 'list')) {
            return 'Page/List';
        }

        return 'Component';
    }
}