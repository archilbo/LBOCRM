<?php

return [

    'default_padding' => 4,

    'types' => [
        'quote' => [
            'label' => 'Devis',
            'prefix' => 'DEV',
            'yearly_reset' => true,
        ],

        'invoice' => [
            'label' => 'Facture',
            'prefix' => 'FAC',
            'yearly_reset' => true,
        ],

        'receipt' => [
            'label' => 'Recu',
            'prefix' => 'REC',
            'yearly_reset' => true,
        ],

        'credit_note' => [
            'label' => 'Avoir',
            'prefix' => 'AV',
            'yearly_reset' => true,
        ],
    ],

];
