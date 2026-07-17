<?php

return [
    'statuses' => [
        'pending' => 'En attente',
        'in_progress' => 'En cours',
        'completed' => 'Termine',
        'blocked' => 'Bloque',
    ],

    'client_project_steps' => [
        [
            'key' => 'documents',
            'label' => 'Documents',
            'description' => 'CIN, certificat de propriete et documents techniques de terrain.',
            'requirements' => [
                ['key' => 'cin', 'label' => 'CIN'],
                ['key' => 'certificat_propriete', 'label' => 'Certificat de propriete'],
                ['key' => 'terrain_documents', 'label' => 'Plan cadastral + calcul de contenance ou plan parcellaire'],
            ],
        ],
        [
            'key' => 'contract',
            'label' => 'Contrat',
            'description' => 'Contrat cree, genere, puis signe/cachete par le client.',
            'requirements' => [
                ['key' => 'contract_created', 'label' => 'Contrat cree'],
                ['key' => 'contract_generated', 'label' => 'Contrat genere'],
                ['key' => 'contract_signed', 'label' => 'Contrat signe/cachete'],
            ],
        ],
        [
            'key' => 'cahier_chantier',
            'label' => 'Cahier de chantier',
            'description' => 'Demande envoyee au centre ingenieur et cahier recu.',
            'requirements' => [
                ['key' => 'engineer_request', 'label' => 'Demande envoyee au centre ingenieur', 'manual' => true],
                ['key' => 'cahier_received', 'label' => 'Cahier de chantier recu'],
            ],
        ],
        [
            'key' => 'rokhas',
            'label' => 'Plateforme Rokhas',
            'description' => 'Depot du dossier complet sur Rokhas avec fiche efficacite energetique.',
            'requirements' => [
                ['key' => 'rokhas_upload', 'label' => 'Dossier depose sur Rokhas'],
                ['key' => 'fiche_energetique', 'label' => 'Fiche efficacite energetique'],
            ],
        ],
        [
            'key' => 'bureau_etude',
            'label' => 'Bureau d etude',
            'description' => 'Documents techniques beton arme, topographie, laboratoire et controle.',
            'requirements' => [
                ['key' => 'contract_bureau_etude', 'label' => 'Contrat bureau d etude'],
                ['key' => 'plan_beton', 'label' => 'Plan beton arme'],
                ['key' => 'implantation_topographie', 'label' => 'Attestation implantation + contrat topographie'],
                ['key' => 'laboratoire_controle', 'label' => 'Contrat laboratoire + bureau de controle'],
            ],
        ],
        [
            'key' => 'permis_habiter',
            'label' => "Permis d habiter",
            'description' => "Demande legalisee, images du site et certificat de propriete recent.",
            'requirements' => [
                ['key' => 'demande_permis_habiter', 'label' => "Demande permis d habiter legalisee"],
                ['key' => 'site_images', 'label' => "Images du site"],
                ['key' => 'recent_certificat_propriete', 'label' => "Certificat de propriete recent si necessaire"],
            ],
        ],
        [
            'key' => 'archive',
            'label' => 'Archive',
            'description' => "Preparation du dossier pour archivage physique : verification des documents, creation de la fiche d archive, et depot en archive.",
            'requirements' => [
                ['key' => 'documents_verified', 'label' => "Documents du dossier verifies"],
                ['key' => 'archive_created', 'label' => "Fiche d archive creee / ARC attribue"],
                ['key' => 'file_stored', 'label' => 'Dossier physique archive (statut stored)'],
            ],
        ],
    ],
];
