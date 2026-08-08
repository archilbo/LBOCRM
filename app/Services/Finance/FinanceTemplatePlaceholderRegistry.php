<?php

namespace App\Services\Finance;

/**
 * Single authoritative registry for Finance template variables.
 *
 * Every placeholder used by a Finance template must be defined here:
 * - key (canonical dot-path resolved by FinanceTemplateRenderer)
 * - label (French, shown in the editor variable picker)
 * - group (picker section)
 * - types (document types the variable applies to; null = all)
 * - trusted (true = pre-generated trusted HTML, rendered without escaping)
 * - sample (preview value; NEVER saved as business data)
 * - aliases (legacy placeholder spellings mapped to the canonical key)
 *
 * The same registry feeds: the editor variable picker, editor validation,
 * preview sample data and production rendering.
 */
class FinanceTemplatePlaceholderRegistry
{
    /**
     * @return array<string, array{key: string, label: string, group: string, types: array<int, string>|null, trusted: bool, sample: string, aliases: array<int, string>}>
     */
    public function definitions(): array
    {
        $all = null;
        $quoteInvoice = ['quote', 'invoice'];
        $quoteInvoiceReceipt = ['quote', 'invoice', 'receipt'];

        return [
            // ── Entreprise ──────────────────────────────────────────────
            'company.name' => [
                'key' => 'company.name',
                'label' => "Nom de l'entreprise",
                'group' => 'Entreprise',
                'types' => $all,
                'trusted' => false,
                'sample' => 'ARCHI LBO SARLAU',
                'aliases' => ['company_name'],
            ],
            'company.logo_html' => [
                'key' => 'company.logo_html',
                'label' => 'Logo de l’entreprise',
                'group' => 'Entreprise',
                'types' => $all,
                'trusted' => true,
                'sample' => '<div class="logo-mark"><span></span><span></span><span></span></div><div class="logo-text">ARCHI LBO</div>',
                'aliases' => ['company_logo', 'company_logo_html'],
            ],
            'company.logo_url' => [
                'key' => 'company.logo_url',
                'label' => 'URL du logo',
                'group' => 'Entreprise',
                'types' => $all,
                'trusted' => false,
                'sample' => '/storage/company/logo.png',
                'aliases' => ['company_logo_url'],
            ],
            'company.representative' => [
                'key' => 'company.representative',
                'label' => 'Représentant légal',
                'group' => 'Entreprise',
                'types' => $all,
                'trusted' => false,
                'sample' => 'LAABISSI OMAR',
                'aliases' => ['company_representative', 'company_ceo', 'legal_representative'],
            ],
            'company.address' => [
                'key' => 'company.address',
                'label' => 'Adresse de l’entreprise',
                'group' => 'Entreprise',
                'types' => $all,
                'trusted' => false,
                'sample' => 'IMMEUBLE NR 959 BUREAU N 1, LOTISSEMENT AL MASSAR MARRAKECH',
                'aliases' => ['company_address'],
            ],
            'company.phone' => [
                'key' => 'company.phone',
                'label' => 'Téléphone',
                'group' => 'Entreprise',
                'types' => $all,
                'trusted' => false,
                'sample' => '+212 6 00 00 00 00',
                'aliases' => ['company_phone', 'company_tel'],
            ],
            'company.fax' => [
                'key' => 'company.fax',
                'label' => 'Fax',
                'group' => 'Entreprise',
                'types' => $all,
                'trusted' => false,
                'sample' => '+212 5 00 00 00 00',
                'aliases' => ['company_fax'],
            ],
            'company.email' => [
                'key' => 'company.email',
                'label' => 'E-mail',
                'group' => 'Entreprise',
                'types' => $all,
                'trusted' => false,
                'sample' => 'contact@archilbo.ma',
                'aliases' => ['company_email'],
            ],
            'company.ice' => [
                'key' => 'company.ice',
                'label' => 'ICE',
                'group' => 'Entreprise',
                'types' => $all,
                'trusted' => false,
                'sample' => '003614682000039',
                'aliases' => ['company_ice'],
            ],
            'company.cnss' => [
                'key' => 'company.cnss',
                'label' => 'CNSS',
                'group' => 'Entreprise',
                'types' => $all,
                'trusted' => false,
                'sample' => '5850815',
                'aliases' => ['company_cnss'],
            ],
            'company.patente' => [
                'key' => 'company.patente',
                'label' => 'Patente',
                'group' => 'Entreprise',
                'types' => $all,
                'trusted' => false,
                'sample' => '64007633',
                'aliases' => ['company_patente'],
            ],
            'company.tva' => [
                'key' => 'company.tva',
                'label' => 'N° TVA',
                'group' => 'Entreprise',
                'types' => $all,
                'trusted' => false,
                'sample' => '66121376',
                'aliases' => ['company_tva', 'tva_number'],
            ],
            'company.legal_line' => [
                'key' => 'company.legal_line',
                'label' => 'Mentions légales (ICE / CNSS / Patente / TVA)',
                'group' => 'Entreprise',
                'types' => $all,
                'trusted' => false,
                'sample' => 'ICE 003614682000039 · CNSS 5850815 · PATENTE 64007633 · TVA 66121376',
                'aliases' => ['company_legal_line', 'legal_line'],
            ],
            'company.contact_line' => [
                'key' => 'company.contact_line',
                'label' => 'Coordonnées de contact (e-mail / téléphone / fax)',
                'group' => 'Entreprise',
                'types' => $all,
                'trusted' => false,
                'sample' => 'EMAIL contact@archilbo.ma · TEL +212 6 00 00 00 00 · FAX +212 5 00 00 00 00',
                'aliases' => ['company_contact_line', 'contact_line'],
            ],

            // ── Banque ──────────────────────────────────────────────────
            'bank.name' => [
                'key' => 'bank.name',
                'label' => 'Banque',
                'group' => 'Banque',
                'types' => $all,
                'trusted' => false,
                'sample' => 'Attijariwafa Bank',
                'aliases' => ['bank_name'],
            ],
            'bank.rib' => [
                'key' => 'bank.rib',
                'label' => 'RIB',
                'group' => 'Banque',
                'types' => $all,
                'trusted' => false,
                'sample' => '007 810 0001234567890123 45',
                'aliases' => ['bank_rib'],
            ],

            // ── Document ────────────────────────────────────────────────
            'document.number' => [
                'key' => 'document.number',
                'label' => 'Numéro du document',
                'group' => 'Document',
                'types' => $all,
                'trusted' => false,
                'sample' => 'DEV-2026-0001',
                'aliases' => ['document_number', 'quote_number', 'invoice_number', 'receipt_number', 'reference'],
            ],
            'document.type_label' => [
                'key' => 'document.type_label',
                'label' => 'Type de document',
                'group' => 'Document',
                'types' => $all,
                'trusted' => false,
                'sample' => 'Devis',
                'aliases' => ['document_type', 'type_label'],
            ],
            'document.status' => [
                'key' => 'document.status',
                'label' => 'Statut',
                'group' => 'Document',
                'types' => $all,
                'trusted' => false,
                'sample' => 'Émis',
                'aliases' => ['document_status'],
            ],
            'document.issue_date' => [
                'key' => 'document.issue_date',
                'label' => 'Date du document',
                'group' => 'Document',
                'types' => $all,
                'trusted' => false,
                'sample' => '07/08/2026',
                'aliases' => ['issue_date', 'document_date', 'date'],
            ],
            'document.due_date' => [
                'key' => 'document.due_date',
                'label' => 'Date d’échéance',
                'group' => 'Document',
                'types' => ['quote', 'invoice'],
                'trusted' => false,
                'sample' => '06/09/2026',
                'aliases' => ['due_date'],
            ],
            'document.valid_until' => [
                'key' => 'document.valid_until',
                'label' => 'Valable jusqu’au',
                'group' => 'Document',
                'types' => ['quote'],
                'trusted' => false,
                'sample' => '06/09/2026',
                'aliases' => ['valid_until'],
            ],
            'document.notes' => [
                'key' => 'document.notes',
                'label' => 'Notes',
                'group' => 'Document',
                'types' => $all,
                'trusted' => false,
                'sample' => 'Note interne exemple.',
                'aliases' => ['document_notes'],
            ],
            'document.terms' => [
                'key' => 'document.terms',
                'label' => 'Conditions',
                'group' => 'Document',
                'types' => $all,
                'trusted' => false,
                'sample' => 'Paiement à réception.',
                'aliases' => ['payment_terms', 'terms'],
            ],
            'document.page' => [
                'key' => 'document.page',
                'label' => 'Numéro de page',
                'group' => 'Document',
                'types' => $all,
                'trusted' => false,
                'sample' => '',
                'aliases' => ['page_number'],
            ],

            // ── Client ──────────────────────────────────────────────────
            'client.name' => [
                'key' => 'client.name',
                'label' => 'Nom du client',
                'group' => 'Client',
                'types' => $all,
                'trusted' => false,
                'sample' => "M'HAMMED ESSAIDI",
                'aliases' => ['client_name'],
            ],
            'client.identifier' => [
                'key' => 'client.identifier',
                'label' => 'CIN / ICE',
                'group' => 'Client',
                'types' => $all,
                'trusted' => false,
                'sample' => 'AB123456',
                'aliases' => ['client_identifier', 'client_id_number'],
            ],
            'client.cin' => [
                'key' => 'client.cin',
                'label' => 'CIN du client',
                'group' => 'Client',
                'types' => $all,
                'trusted' => false,
                'sample' => 'AB123456',
                'aliases' => ['client_cin'],
            ],
            'client.ice' => [
                'key' => 'client.ice',
                'label' => 'ICE du client',
                'group' => 'Client',
                'types' => $all,
                'trusted' => false,
                'sample' => '001234567000045',
                'aliases' => ['client_ice'],
            ],
            'client.address' => [
                'key' => 'client.address',
                'label' => 'Adresse du client',
                'group' => 'Client',
                'types' => $all,
                'trusted' => false,
                'sample' => 'AVENUE MOHAMMED V, MARRAKECH',
                'aliases' => ['client_address'],
            ],
            'client.phone' => [
                'key' => 'client.phone',
                'label' => 'Téléphone du client',
                'group' => 'Client',
                'types' => $all,
                'trusted' => false,
                'sample' => '+212 6 11 22 33 44',
                'aliases' => ['client_phone'],
            ],
            'client.email' => [
                'key' => 'client.email',
                'label' => 'E-mail du client',
                'group' => 'Client',
                'types' => $all,
                'trusted' => false,
                'sample' => 'client@exemple.ma',
                'aliases' => ['client_email'],
            ],

            // ── Projet ──────────────────────────────────────────────────
            'dossier.number' => [
                'key' => 'dossier.number',
                'label' => 'Numéro de dossier',
                'group' => 'Projet',
                'types' => $all,
                'trusted' => false,
                'sample' => 'DOS-2026-0001',
                'aliases' => ['dossier_number', 'project_number'],
            ],
            'dossier.project_object' => [
                'key' => 'dossier.project_object',
                'label' => 'Objet du projet',
                'group' => 'Projet',
                'types' => $all,
                'trusted' => false,
                'sample' => "CONSTRUCTION D'UN R+1",
                'aliases' => ['project_object', 'project_name', 'projet'],
            ],
            'dossier.address' => [
                'key' => 'dossier.address',
                'label' => 'Adresse du projet',
                'group' => 'Projet',
                'types' => $all,
                'trusted' => false,
                'sample' => 'LOT N 12, QUARTIER AL MASSAR, MARRAKECH',
                'aliases' => ['project_address', 'project_address_full'],
            ],
            'dossier.city' => [
                'key' => 'dossier.city',
                'label' => 'Ville du projet',
                'group' => 'Projet',
                'types' => $all,
                'trusted' => false,
                'sample' => 'MARRAKECH',
                'aliases' => ['project_city', 'city'],
            ],
            'dossier.commune' => [
                'key' => 'dossier.commune',
                'label' => 'Commune',
                'group' => 'Projet',
                'types' => $all,
                'trusted' => false,
                'sample' => 'COMMUNE AL MASSAR',
                'aliases' => ['project_commune'],
            ],
            'dossier.province' => [
                'key' => 'dossier.province',
                'label' => 'Province',
                'group' => 'Projet',
                'types' => $all,
                'trusted' => false,
                'sample' => 'PRÉFECTURE DE MARRAKECH',
                'aliases' => ['project_province'],
            ],
            'dossier.land_title_number' => [
                'key' => 'dossier.land_title_number',
                'label' => 'Titre foncier',
                'group' => 'Projet',
                'types' => $all,
                'trusted' => false,
                'sample' => 'TF 12345/67',
                'aliases' => ['title_foncier', 'land_title_number', 'tf'],
            ],

            // ── Montants ────────────────────────────────────────────────
            'totals.subtotal_ht' => [
                'key' => 'totals.subtotal_ht',
                'label' => 'Total HT',
                'group' => 'Montants',
                'types' => $quoteInvoice,
                'trusted' => false,
                'sample' => '10 000.00 MAD',
                'aliases' => ['total_ht', 'subtotal_ht'],
            ],
            'totals.discount_total' => [
                'key' => 'totals.discount_total',
                'label' => 'Remise',
                'group' => 'Montants',
                'types' => $quoteInvoice,
                'trusted' => false,
                'sample' => '0.00 MAD',
                'aliases' => ['discount_total', 'total_remise'],
            ],
            'totals.discount_line' => [
                'key' => 'totals.discount_line',
                'label' => 'Ligne remise (vide si remise nulle)',
                'group' => 'Montants',
                'types' => $quoteInvoice,
                'trusted' => false,
                'sample' => '',
                'aliases' => ['discount_line'],
            ],
            'totals.tax_rate' => [
                'key' => 'totals.tax_rate',
                'label' => 'Taux TVA',
                'group' => 'Montants',
                'types' => $quoteInvoice,
                'trusted' => false,
                'sample' => '20',
                'aliases' => ['tva_rate', 'tax_rate'],
            ],
            'totals.tax_total' => [
                'key' => 'totals.tax_total',
                'label' => 'Montant TVA',
                'group' => 'Montants',
                'types' => $quoteInvoice,
                'trusted' => false,
                'sample' => '2 000.00 MAD',
                'aliases' => ['tax_total', 'tva_amount', 'tax_amount'],
            ],
            'totals.total_ttc' => [
                'key' => 'totals.total_ttc',
                'label' => 'Total TTC',
                'group' => 'Montants',
                'types' => $quoteInvoiceReceipt,
                'trusted' => false,
                'sample' => '12 000.00 MAD',
                'aliases' => ['total_ttc', 'grand_total'],
            ],
            'totals.amount_in_words' => [
                'key' => 'totals.amount_in_words',
                'label' => 'Montant en lettres',
                'group' => 'Montants',
                'types' => $quoteInvoiceReceipt,
                'trusted' => false,
                'sample' => 'Douze mille dirhams',
                'aliases' => ['amount_in_words', 'total_in_words', 'montant_en_lettres'],
            ],
            'totals.paid_total' => [
                'key' => 'totals.paid_total',
                'label' => 'Montant payé',
                'group' => 'Montants',
                'types' => ['invoice', 'receipt'],
                'trusted' => false,
                'sample' => '4 000.00 MAD',
                'aliases' => ['paid_total', 'total_paid'],
            ],
            'totals.remaining_total' => [
                'key' => 'totals.remaining_total',
                'label' => 'Reste à payer',
                'group' => 'Montants',
                'types' => ['invoice', 'receipt'],
                'trusted' => false,
                'sample' => '8 000.00 MAD',
                'aliases' => ['remaining_total', 'total_remaining', 'reste'],
            ],

            // ── Paiement ────────────────────────────────────────────────
            'payment.method' => [
                'key' => 'payment.method',
                'label' => 'Mode de paiement',
                'group' => 'Paiement',
                'types' => ['invoice', 'receipt'],
                'trusted' => false,
                'sample' => 'Virement bancaire',
                'aliases' => ['payment_method', 'mode_paiement'],
            ],
            'payment.reference' => [
                'key' => 'payment.reference',
                'label' => 'Référence du paiement',
                'group' => 'Paiement',
                'types' => ['invoice', 'receipt'],
                'trusted' => false,
                'sample' => 'VIR-2026-00123',
                'aliases' => ['payment_reference', 'reference_paiement'],
            ],
            'payment.amount' => [
                'key' => 'payment.amount',
                'label' => 'Montant payé',
                'group' => 'Paiement',
                'types' => ['invoice', 'receipt'],
                'trusted' => false,
                'sample' => '4 000.00 MAD',
                'aliases' => ['payment_amount', 'amount', 'montant'],
            ],
            'payment.date' => [
                'key' => 'payment.date',
                'label' => 'Date du paiement',
                'group' => 'Paiement',
                'types' => ['invoice', 'receipt'],
                'trusted' => false,
                'sample' => '07/08/2026',
                'aliases' => ['payment_date', 'date_paiement'],
            ],

            // ── Tableaux ────────────────────────────────────────────────
            'items_table' => [
                'key' => 'items_table',
                'label' => 'Tableau des prestations',
                'group' => 'Tableaux',
                'types' => $quoteInvoice,
                'trusted' => true,
                'sample' => '<table class="items-table finance-items-table"><thead class="finance-items-table__head"><tr><th>DÉSIGNATION</th><th>QTÉ</th><th>PRIX UNITAIRE HT</th><th>PRIX TOTAL HT</th></tr></thead><tbody class="finance-items-table__body"><tr class="finance-items-table__row"><td><strong>Études architecturales</strong><br><span>Plans et dossier administratif</span></td><td class="text-right">1</td><td class="text-right">8 000.00 MAD</td><td class="text-right">8 000.00 MAD</td></tr></tbody></table>',
                'aliases' => ['items_rows', 'item_table'],
            ],
            'payments_table' => [
                'key' => 'payments_table',
                'label' => 'Tableau des paiements',
                'group' => 'Tableaux',
                'types' => ['invoice', 'receipt'],
                'trusted' => true,
                'sample' => '<table class="payments-table finance-items-table"><thead class="finance-items-table__head"><tr><th>Paiement</th><th>Date</th><th>Mode</th><th>Référence</th><th>Montant</th></tr></thead><tbody class="finance-items-table__body"><tr class="finance-items-table__row"><td>PAY-2026-0001</td><td>07/08/2026</td><td>Virement bancaire</td><td>VIR-2026-00123</td><td class="text-right">4 000.00 MAD</td></tr></tbody></table>',
                'aliases' => ['payment_rows'],
            ],
            'receipt_table' => [
                'key' => 'receipt_table',
                'label' => 'Tableau du reçu de paiement',
                'group' => 'Tableaux',
                'types' => ['receipt'],
                'trusted' => true,
                'sample' => '<table class="receipt-table finance-items-table"><thead class="finance-items-table__head"><tr><th>DATE</th><th>OBJET</th><th class="text-right">MONTANT<br>NÉGOCIÉ</th><th class="text-right">AVANCE</th><th>MODE DE<br>PAIEMENT</th><th class="text-right">RESTE</th></tr></thead><tbody class="finance-items-table__body"><tr class="finance-items-table__row"><td>07/08/2026</td><td>Règlement facture INV-2026-0001</td><td class="text-right">12 000.00 MAD</td><td class="text-right">4 000.00 MAD</td><td>Virement bancaire</td><td class="text-right">8 000.00 MAD</td></tr><tr class="receipt-total-row"><td colspan="2" class="receipt-total-label">TOTAL</td><td class="text-right">12 000.00 MAD</td><td class="text-right">4 000.00 MAD</td><td></td><td class="text-right">8 000.00 MAD</td></tr></tbody></table>',
                'aliases' => ['receipt_rows'],
            ],
        ];
    }

    /**
     * Grouped structure consumed by the editor variable picker.
     *
     * @return array<int, array{group: string, items: array<int, array{key: string, label: string}>}>
     */
    public function all(?string $type = null): array
    {
        $groups = [];

        foreach ($this->definitions() as $definition) {
            if ($type !== null && $definition['types'] !== null && ! in_array($type, $definition['types'], true)) {
                continue;
            }

            $groups[$definition['group']][] = [
                'key' => '{{' . $definition['key'] . '}}',
                'label' => $definition['label'],
            ];
        }

        return collect($groups)
            ->map(fn (array $items, string $group) => ['group' => $group, 'items' => $items])
            ->values()
            ->all();
    }

    /**
     * Flat list of every placeholder string accepted by validation
     * (canonical keys + legacy aliases). Legacy templates keep working.
     *
     * @return array<int, string>
     */
    public function knownPlaceholders(): array
    {
        $known = [];

        foreach ($this->definitions() as $definition) {
            $known[] = '{{' . $definition['key'] . '}}';

            foreach ($definition['aliases'] as $alias) {
                $known[] = '{{' . $alias . '}}';
            }
        }

        return $known;
    }

    /**
     * Known placeholder tokens (canonical + aliases) valid for one document type.
     * The frontend uses this to validate live without duplicating any list.
     *
     * @return array<int, string>
     */
    public function knownForType(string $type): array
    {
        $known = [];

        foreach ($this->definitions() as $definition) {
            if ($definition['types'] !== null && ! in_array($type, $definition['types'], true)) {
                continue;
            }

            $known[] = '{{' . $definition['key'] . '}}';

            foreach ($definition['aliases'] as $alias) {
                $known[] = '{{' . $alias . '}}';
            }
        }

        return $known;
    }

    /**
     * Canonical dot-path keys that may render trusted generated HTML.
     *
     * @return array<int, string>
     */
    public function trustedKeys(): array
    {
        return collect($this->definitions())
            ->filter(fn (array $definition) => (bool) $definition['trusted'])
            ->keys()
            ->all();
    }

    /**
     * Unknown placeholder validation for editor saves.
     *
     * @return array<int, string> unknown placeholder tokens, e.g. ['{{foo_bar}}']
     */
    public function validateContent(string $html): array
    {
        return $this->unknownPlaceholdersIn($html);
    }

    /**
     * Extract every {{...}} token and return the ones that are neither a
     * canonical key nor a registered legacy alias.
     *
     * - duplicates are returned once
     * - ordering is deterministic (order of first occurrence)
     * - plain CSS/HTML braces ({ ... } or } {) are not matched
     *
     * @return array<int, string> e.g. ['{{company_magic_value}}']
     */
    public function unknownPlaceholdersIn(string $content): array
    {
        $known = array_flip($this->knownPlaceholders());
        $found = [];

        preg_match_all('/{{\s*([^{}]+?)\s*}}/', $content, $matches);

        foreach ($matches[0] as $index => $token) {
            $candidate = '{{' . trim($matches[1][$index]) . '}}';

            if (! isset($known[$candidate])) {
                $found[$candidate] = true;
            }
        }

        return array_keys($found);
    }

    /**
     * Preview sample data shaped exactly like production render data.
     * Sample values are display-only and never persisted as business data.
     * The optional type keeps the sample reference semantically correct per
     * document (DEV-… / FAC-… / REC-…) so receipts never show a Devis number.
     */
    public function sampleData(?string $type = null): array
    {
        $currency = FinanceSettingsService::getCurrency();
        $type ??= 'quote';

        return [
            'company' => [
                'name' => FinanceSettingsService::getCompanyName() ?: 'ARCHI LBO SARLAU',
                'representative' => FinanceSettingsService::getCompanyLegalRepresentative() ?: 'LAABISSI OMAR',
                'address' => FinanceSettingsService::getCompanyAddress() ?: 'IMMEUBLE NR 959 BUREAU N 1, LOTISSEMENT AL MASSAR MARRAKECH',
                'phone' => FinanceSettingsService::getCompanyPhone() ?: '+212 6 00 00 00 00',
                'fax' => FinanceSettingsService::getCompanyFax() ?: '+212 5 00 00 00 00',
                'email' => FinanceSettingsService::getCompanyEmail() ?: 'contact@archilbo.ma',
                'ice' => FinanceSettingsService::getCompanyIce() ?: '003614682000039',
                'tva' => FinanceSettingsService::getCompanyTva() ?: '66121376',
                'patente' => FinanceSettingsService::getCompanyPatente() ?: '64007633',
                'cnss' => FinanceSettingsService::getCompanyCnss() ?: '5850815',
                'logo_url' => FinanceSettingsService::getCompanyLogoUrl(),
                'logo_html' => FinanceSettingsService::getCompanyLogoHtml(),
                'legal_line' => FinanceSettingsService::getCompanyLegalLine(),
                'contact_line' => FinanceSettingsService::getCompanyContactLine(),
            ],
            'bank' => [
                'name' => FinanceSettingsService::getBankName() ?: 'Banque Exemple',
                'rib' => FinanceSettingsService::getBankRib() ?: '007 810 0001234567890123 45',
            ],
            'document' => [
                'id' => null,
                'type' => $type,
                'type_label' => match ($type) {
                    'invoice' => 'Facture',
                    'receipt' => 'Reçu',
                    default => 'Devis',
                },
                'number' => match ($type) {
                    'invoice' => 'FAC-2026-0001',
                    'receipt' => 'REC-2026-0001',
                    default => 'DEV-2026-0001',
                },
                'status' => 'Émis',
                'issue_date' => '07/08/2026',
                'due_date' => '06/09/2026',
                'valid_until' => '06/09/2026',
                'currency' => $currency,
                'notes' => 'Note interne exemple.',
                'terms' => 'Paiement à réception.',
                'tax_rate' => (string) FinanceSettingsService::getTvaRate(),
            ],
            'client' => [
                'name' => "M'HAMMED ESSAIDI",
                'identifier' => 'AB123456',
                'cin' => 'AB123456',
                'ice' => '001234567000045',
                'address' => 'AVENUE MOHAMMED V, MARRAKECH',
                'phone' => '+212 6 11 22 33 44',
                'email' => 'client@exemple.ma',
            ],
            'dossier' => [
                'number' => 'DOS-2026-0001',
                'project_object' => "CONSTRUCTION D'UN R+1",
                'address' => 'LOT N 12, QUARTIER AL MASSAR, MARRAKECH',
                'city' => 'MARRAKECH',
                'commune' => 'COMMUNE AL MASSAR',
                'province' => 'PRÉFECTURE DE MARRAKECH',
                'land_title_number' => 'TF 12345/67',
            ],
            'items' => [
                ['position' => 1, 'title' => 'Études architecturales', 'description' => 'Plans et dossier administratif', 'quantity' => 1, 'unit' => 'forfait', 'unit_price_display' => '8 000.00 ' . $currency, 'total_ht_display' => '8 000.00 ' . $currency, 'total_ttc_display' => '8 000.00 ' . $currency],
                ['position' => 2, 'title' => 'Suivi de dossier', 'description' => 'Suivi administratif', 'quantity' => 1, 'unit' => 'forfait', 'unit_price_display' => '2 000.00 ' . $currency, 'total_ht_display' => '2 000.00 ' . $currency, 'total_ttc_display' => '2 000.00 ' . $currency],
            ],
            'totals' => [
                'subtotal_ht' => '10 000.00 ' . $currency,
                'discount_total' => '0.00 ' . $currency,
                'discount_line' => '',
                'tax_rate' => (string) FinanceSettingsService::getTvaRate(),
                'tax_total' => '2 000.00 ' . $currency,
                'total_ttc' => '12 000.00 ' . $currency,
                'paid_total' => '4 000.00 ' . $currency,
                'remaining_total' => '8 000.00 ' . $currency,
                'amount_in_words' => app(FinanceAmountInWords::class)->format(12000.00, $currency),
            ],
            'payments' => [
                [
                    'payment_number' => 'PAY-2026-0001',
                    'paid_at' => '07/08/2026',
                    'method' => 'Virement bancaire',
                    'reference' => 'VIR-2026-00123',
                    'amount_display' => '4 000.00 ' . $currency,
                    'object' => 'Règlement Facture FAC-2026-0001',
                    'negotiated' => 12000.0,
                    'advance' => 4000.0,
                    'remaining' => 8000.0,
                    'negotiated_display' => '12 000.00 ' . $currency,
                    'advance_display' => '4 000.00 ' . $currency,
                    'remaining_display' => '8 000.00 ' . $currency,
                ],
            ],
            'receipt' => [
                'method' => 'Virement bancaire',
                'reference' => 'VIR-2026-00123',
                'amount_display' => '4 000.00 ' . $currency,
                'date' => '07/08/2026',
            ],
            'payment' => [
                'method' => 'Virement bancaire',
                'reference' => 'VIR-2026-00123',
                'amount' => '4 000.00 ' . $currency,
                'date' => '07/08/2026',
            ],
        ];
    }
}
