<?php

return [
    'cin' => [
        'canonical_code' => 'CIN',
        'code_aliases' => ['TMPL-CIN'],
        'name_aliases' => ['CIN', 'CNI', 'Carte nationale'],
        'name' => 'CIN',
        'document_type' => 'identity',
        'upload_mode' => 'cin_pair',
        'is_required' => true,
        'sort_order' => 10,
    ],

    'certificat_propriete' => [
        'canonical_code' => 'CERTIFICAT_PROPRIETE',
        'code_aliases' => ['TMPL-Certificat-de-propriete'],
        'name_aliases' => [
            'Certificat de propriete',
            'Certificat de propriété',
            'Titre foncier',
        ],
        'name' => 'Certificat de propriété',
        'document_type' => 'property',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 20,
    ],

    'plan_cadastral' => [
        'canonical_code' => 'PLAN_CADASTRAL',
        'code_aliases' => ['TMPL-Plan-cadastral'],
        'name_aliases' => ['Plan cadastral'],
        'name' => 'Plan cadastral',
        'document_type' => 'property',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 30,
    ],

    'calcul_contenance' => [
        'canonical_code' => 'CALCUL_CONTENANCE',
        'code_aliases' => ['TMPL-Calcul-de-contenance'],
        'name_aliases' => ['Calcul de contenance'],
        'name' => 'Calcul de contenance',
        'document_type' => 'property',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 40,
    ],

    'plan_parcellaire' => [
        'canonical_code' => 'PLAN_PARCELLAIRE',
        'code_aliases' => ['TMPL-Plan-parcellaire'],
        'name_aliases' => ['Plan parcellaire'],
        'name' => 'Plan parcellaire',
        'document_type' => 'property',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 50,
    ],

    'engineer_request' => [
        'canonical_code' => 'DEMANDE_INGENIEUR',
        'code_aliases' => [],
        'name_aliases' => [
            'Demande ingénieur',
            'Demande ingenieur',
        ],
        'name' => 'Demande ingénieur',
        'document_type' => 'cahier_chantier',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 60,
    ],

    'cahier_received' => [
        'canonical_code' => 'CAHIER_CHANTIER',
        'code_aliases' => ['TMPL-Cahier-de-chantier'],
        'name_aliases' => ['Cahier de chantier'],
        'name' => 'Cahier de chantier',
        'document_type' => 'cahier_chantier',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 70,
    ],

    'rokhas_upload' => [
        'canonical_code' => 'DOSSIER_ROKHAS',
        'code_aliases' => [],
        'name_aliases' => [
            'Dossier Rokhas',
            'Rokhas',
            'Récépissé de dépôt Rokhas',
        ],
        'name' => 'Dossier Rokhas',
        'document_type' => 'rokhas',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 80,
    ],

    'fiche_energetique' => [
        'canonical_code' => 'FICHE_ENERGETIQUE',
        'code_aliases' => ['TMPL-Fiche-energetique'],
        'name_aliases' => [
            'Fiche énergétique',
            'Fiche energetique',
        ],
        'name' => 'Fiche énergétique',
        'document_type' => 'rokhas',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 90,
    ],

    'contract_bureau_etude' => [
        'canonical_code' => 'CONTRAT_BUREAU_ETUDE',
        'code_aliases' => ['TMPL-Contrat-BE'],
        'name_aliases' => [
            'Contrat BE',
            'Contrat bureau étude',
            'Contrat bureau etude',
        ],
        'name' => 'Contrat bureau d\'étude',
        'document_type' => 'bureau_etude',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 100,
    ],

    'plan_beton' => [
        'canonical_code' => 'PLAN_BETON_ARME',
        'code_aliases' => ['TMPL-Plan-beton-arme'],
        'name_aliases' => [
            'Plan béton armé',
            'Plan beton arme',
        ],
        'name' => 'Plan béton armé',
        'document_type' => 'bureau_etude',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 110,
    ],

    'attestation_implantation' => [
        'canonical_code' => 'ATTESTATION_IMPLANTATION',
        'code_aliases' => ['TMPL-Attestation-implantation'],
        'name_aliases' => [
            'Attestation implantation',
            'Attestation d\'implantation',
        ],
        'name' => 'Attestation d\'implantation',
        'document_type' => 'bureau_etude',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 120,
    ],

    'contrat_topographie' => [
        'canonical_code' => 'CONTRAT_TOPOGRAPHIE',
        'code_aliases' => ['TMPL-Contrat-topographie'],
        'name_aliases' => ['Contrat topographie'],
        'name' => 'Contrat topographie',
        'document_type' => 'bureau_etude',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 130,
    ],

    'contrat_laboratoire' => [
        'canonical_code' => 'CONTRAT_LABORATOIRE',
        'code_aliases' => ['TMPL-Contrat-laboratoire'],
        'name_aliases' => ['Contrat laboratoire'],
        'name' => 'Contrat laboratoire',
        'document_type' => 'bureau_etude',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 140,
    ],

    'bureau_controle' => [
        'canonical_code' => 'BUREAU_CONTROLE',
        'code_aliases' => ['TMPL-Bureau-de-controle'],
        'name_aliases' => [
            'Bureau de contrôle',
            'Bureau de controle',
        ],
        'name' => 'Bureau de contrôle',
        'document_type' => 'bureau_etude',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 150,
    ],

    'demande_permis_habiter' => [
        'canonical_code' => 'DEMANDE_PERMIS_HABITER',
        'code_aliases' => [],
        'name_aliases' => [
            'Demande permis d\'habiter',
            'Demande permis habiter',
        ],
        'name' => 'Demande permis d\'habiter',
        'document_type' => 'permis_habiter',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 160,
    ],

    'site_images' => [
        'canonical_code' => 'PHOTOS_SITE',
        'code_aliases' => [],
        'name_aliases' => [
            'Photos du site',
            'Images du site',
        ],
        'name' => 'Photos du site',
        'document_type' => 'permis_habiter',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 170,
    ],

    /*
     * This workflow requirement deliberately reuses the normal
     * Certificat de propriété template.
     */
    'recent_certificat_propriete' => [
        'canonical_code' => 'CERTIFICAT_PROPRIETE',
        'code_aliases' => ['TMPL-Certificat-de-propriete'],
        'name_aliases' => [
            'Certificat de propriete',
            'Certificat de propriété',
            'Titre foncier',
        ],
        'name' => 'Certificat de propriété',
        'document_type' => 'property',
        'upload_mode' => 'single',
        'is_required' => true,
        'sort_order' => 20,
    ],
];
