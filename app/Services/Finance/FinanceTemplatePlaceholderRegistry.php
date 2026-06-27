<?php

namespace App\Services\Finance;

class FinanceTemplatePlaceholderRegistry
{
    public function all(): array
    {
        return [
            ['group' => 'Company', 'items' => ['{{company.name}}', '{{company.address}}', '{{company.phone}}', '{{company.email}}', '{{company.ice}}', '{{company.tva}}', '{{company.patente}}', '{{company.cnss}}']],
            ['group' => 'Bank', 'items' => ['{{bank.name}}', '{{bank.rib}}']],
            ['group' => 'Document', 'items' => ['{{document.number}}', '{{document.type_label}}', '{{document.status}}', '{{document.issue_date}}', '{{document.due_date}}', '{{document.valid_until}}', '{{document.notes}}', '{{document.terms}}']],
            ['group' => 'Client', 'items' => ['{{client.name}}', '{{client.cin}}', '{{client.address}}', '{{client.phone}}', '{{client.email}}']],
            ['group' => 'Dossier', 'items' => ['{{dossier.number}}', '{{dossier.project_object}}', '{{dossier.address}}', '{{dossier.commune}}', '{{dossier.province}}']],
            ['group' => 'Totals', 'items' => ['{{totals.subtotal_ht}}', '{{totals.discount_total}}', '{{totals.tax_total}}', '{{totals.total_ttc}}', '{{totals.paid_total}}', '{{totals.remaining_total}}']],
            ['group' => 'Special', 'items' => ['{{items_table}}', '{{payments_table}}']],
        ];
    }

    public function flat(): array
    {
        return collect($this->all())->flatMap(fn (array $group) => $group['items'])->values()->all();
    }
}
