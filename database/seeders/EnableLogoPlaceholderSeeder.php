<?php

namespace Database\Seeders;

use App\Models\DocumentTemplate;
use Illuminate\Database\Seeder;

class EnableLogoPlaceholderSeeder extends Seeder
{
    public function run(): void
    {
        DocumentTemplate::query()
            ->whereIn('type', ['quote', 'invoice', 'receipt'])
            ->get()
            ->each(function (DocumentTemplate $template) {
                $header = (string) $template->header_html;

                if (!str_contains($header, '{{company.logo_html}}')) {
                    $pattern = '/<div class="logo-block">\s*<div class="logo-mark">.*?<div class="logo-text">ARCHI LBO<\/div>\s*<\/div>/s';

                    if (preg_match($pattern, $header)) {
                        $header = preg_replace(
                            $pattern,
                            '<div class="logo-block">{{company.logo_html}}</div>',
                            $header
                        ) ?? $header;
                    } elseif (str_contains($header, '<header')) {
                        $header = preg_replace(
                            '/<header([^>]*)>/',
                            '<header$1><div class="logo-block">{{company.logo_html}}</div>',
                            $header,
                            1
                        ) ?? $header;
                    }
                }

                $css = (string) $template->css;

                if (!str_contains($css, '.company-logo-img')) {
                    $css .= "\n\n.company-logo-img {\n    max-width: 28mm;\n    max-height: 28mm;\n    width: auto;\n    height: auto;\n    display: block;\n    margin: 0 auto 1mm;\n    object-fit: contain;\n}\n";
                }

                $template->forceFill([
                    'header_html' => $header,
                    'css' => $css,
                ])->save();
            });
    }
}