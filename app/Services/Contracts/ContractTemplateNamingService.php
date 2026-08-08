<?php

namespace App\Services\Contracts;

use Illuminate\Support\Facades\File;
use InvalidArgumentException;

class ContractTemplateNamingService
{
    public function keyFor(string $calculationType, string|int|float|null $percentageRate = null): string
    {
        if ($calculationType === 'forfait') {
            return 'forfait';
        }

        if ($calculationType !== 'percentage' || $percentageRate === null) {
            throw new InvalidArgumentException('A percentage rate is required to determine the contract template key.');
        }

        $rate = str_replace(',', '.', trim((string) $percentageRate));
        if (! preg_match('/^\d+(?:\.\d+)?$/', $rate)) {
            throw new InvalidArgumentException('The percentage rate has an invalid format.');
        }

        [$integer, $decimal] = array_pad(explode('.', $rate, 2), 2, '');
        $integer = ltrim($integer, '0') ?: '0';
        $decimal = rtrim($decimal, '0');

        return $decimal === '' ? $integer : $integer . '_' . $decimal;
    }

    public function filenameFor(string $calculationType, string|int|float|null $percentageRate = null): string
    {
        return 'contrat_architecte_' . $this->keyFor($calculationType, $percentageRate) . '.docx';
    }

    /** @return array{type: 'percentage'|'forfait', rate: string|null, key: string, filename: string}|null */
    public function parseFilename(string $filename): ?array
    {
        $filename = basename($filename);
        if (! preg_match('/^contrat_architecte_(forfait|\d+(?:_\d+)?)\.docx$/i', $filename, $matches)) {
            return null;
        }

        $suffix = strtolower($matches[1]);
        if ($suffix === 'forfait') {
            return ['type' => 'forfait', 'rate' => null, 'key' => 'forfait', 'filename' => $filename];
        }

        $rate = str_replace('_', '.', $suffix);
        $key = $this->keyFor('percentage', $rate);

        return [
            'type' => 'percentage',
            'rate' => number_format((float) $rate, 4, '.', ''),
            'key' => $key,
            'filename' => $filename,
        ];
    }

    public function pathForKey(string $key): string
    {
        if (! preg_match('/^(?:forfait|\d+(?:_\d+)?)$/', $key)) {
            throw new InvalidArgumentException('The contract template key is invalid.');
        }

        return rtrim((string) config('archilbo_templates.contracts.master_directory'), DIRECTORY_SEPARATOR)
            . DIRECTORY_SEPARATOR . 'contrat_architecte_' . $key . '.docx';
    }

    /** @return array<string, array{templates: list<array{type: 'percentage'|'forfait', rate: string|null, key: string, filename: string}>, ambiguous: bool}> */
    public function discover(): array
    {
        $directory = (string) config('archilbo_templates.contracts.master_directory');
        if (! File::isDirectory($directory)) {
            return [];
        }

        return collect(File::files($directory))
            ->map(fn (\SplFileInfo $file) => $this->parseFilename($file->getFilename()))
            ->filter()
            ->groupBy('key')
            ->map(fn ($templates) => ['templates' => $templates->values()->all(), 'ambiguous' => $templates->count() !== 1])
            ->all();
    }
}
