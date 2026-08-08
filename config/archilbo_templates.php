<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Original ARCHI LBO templates
    |--------------------------------------------------------------------------
    |
    | These templates are stored privately and copied only when generating
    | documents. Do not edit generated files. Edit only the source templates.
    |
    */

    'contracts' => [
        'master_directory' => storage_path('app/private/archi-templates/contracts'),
        'default_rate' => env('ARCHI_LBO_DEFAULT_CONTRACT_RATE', '0.5'),
        'construction_unit_price' => env('ARCHI_LBO_CONSTRUCTION_UNIT_PRICE', 900),
        'tva_rate' => env('ARCHI_LBO_CONTRACT_TVA_RATE', 20),

        'templates' => [
            '0_5' => storage_path('app/private/archi-templates/contracts/contrat_architecte_0_5.docx'),
            '2' => storage_path('app/private/archi-templates/contracts/contrat_architecte_2.docx'),
            'forfait' => storage_path('app/private/archi-templates/contracts/contrat_architecte_forfait.docx'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Fiche efficacité template
    |--------------------------------------------------------------------------
    |
    | Master template, copied (never edited) at generation time. The DOCX
    | contains [USAGE_DU_BATIMENT], [NOM_PROJET], [PROJET_ADDRESS],
    | [NOM_PRENOM_DOUVRAGE], [CLIENT_ADDRESS], [ENTREPRISE_PHONE] and
    | [ENTREPRISE_FAX] placeholders — see ProjectEfficiencySheetGenerator.
    |
    */

    'fiche_efficacite' => [
        'template' => storage_path('app/private/archi-templates/fiche_efficacite/fiche_efficacite.docx'),
    ],

    'finance' => [
        'devis' => storage_path('app/private/archi-templates/finance/DEVIS ARCHI LBO.xlsx'),
        'facture' => storage_path('app/private/archi-templates/finance/FACTURE.xlsx'),
        'recu' => storage_path('app/private/archi-templates/finance/RECU ARCHI LBO.xlsx'),
    ],
];
