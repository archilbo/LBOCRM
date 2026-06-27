<?php

namespace App\Services\Finance;

class FinanceTemplatePlaceholderRegistry
{
    public function all(): array
    {
        return [
            [
                'group' => 'Company',
                'items' => [
                    '{{company.name}}',
                    '{{company.address}}',
                    '{{company.phone}}',
                    '{{company.email}}',
                    '{{company.ice}}',
                    '{{company.tva}}',
                    '{{company.patente}}',
                    '{{company.cnss}}',
                    '{{company.logo_url}}',
                    '{{company.logo_html}}',
                ],
            ],
            [
                'group' => 'Bank',
                'items' => [
                    '{{bank.name}}',
                    '{{bank.rib}}',
                ],
            ],
            [
                'group' => 'Document',
                'items' => [
                    '{{document.number}}',
                    '{{document.type_label}}',
                    '{{document.status}}',
                    '{{document.issue_date}}',
                    '{{document.due_date}}',
                    '{{document.valid_until}}',
                ],
            ],
            [
                'group' => 'Client',
                'items' => [
                    '{{client.name}}',
                    '{{client.cin}}',
                    '{{client.address}}',
                    '{{client.phone}}',
                    '{{client.email}}',
                ],
            ],
            [
                'group' => 'Dossier',
                'items' => [
                    '{{dossier.number}}',
                    '{{dossier.project_object}}',
                    '{{dossier.address}}',
                    '{{dossier.commune}}',
                    '{{dossier.province}}',
                ],
            ],
            [
                'group' => 'Totals',
                'items' => [
                    '{{totals.subtotal_ht}}',
                    '{{totals.tax_total}}',
                    '{{totals.total_ttc}}',
                    '{{totals.paid_total}}',
                    '{{totals.remaining_total}}',
                ],
            ],
            [
                'group' => 'Special',
                'items' => [
                    '{{items_table}}',
                    '{{payments_table}}',
                ],
            ],
        ];
    }
}