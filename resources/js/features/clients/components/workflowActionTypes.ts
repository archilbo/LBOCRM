export type WorkflowActionType =
    | 'upload_document'
    | 'create_contract'
    | 'generate_contract'
    | 'mark_signed'
    | 'mark_done'
    | 'open_module'
    | 'no_action';

export function getRequirementActionType(stepKey: string, requirementKey: string): WorkflowActionType {
    const key = `${stepKey}.${requirementKey}`;
    switch (key) {
        case 'documents.cin':
        case 'documents.certificat_propriete':
        case 'documents.plan_cadastral':
        case 'documents.calcul_contenance':
        case 'documents.plan_parcellaire':
        case 'rokhas.fiche_energetique':
        case 'bureau_etude.contract_bureau_etude':
        case 'bureau_etude.plan_beton':
        case 'bureau_etude.attestation_implantation':
        case 'bureau_etude.contrat_topographie':
        case 'bureau_etude.contrat_laboratoire':
        case 'bureau_etude.bureau_controle':
        case 'permis_habiter.demande_permis_habiter':
        case 'permis_habiter.site_images':
        case 'permis_habiter.recent_certificat_propriete':
            return 'upload_document';
        case 'contract.contract_created':
            return 'create_contract';
        case 'contract.contract_generated':
            return 'generate_contract';
        case 'contract.contract_signed':
            return 'mark_signed';
        case 'cahier_chantier.engineer_request':
        case 'archive.documents_verified':
        case 'archive.file_stored':
            return 'mark_done';
        case 'rokhas.rokhas_upload':
        case 'cahier_chantier.cahier_received':
        case 'archive.archive_created':
            return 'open_module';
        default:
            return 'no_action';
    }
}

export function getStepActionType(stepKey: string): WorkflowActionType {
    switch (stepKey) {
        case 'documents':
        case 'cahier_chantier':
        case 'bureau_etude':
        case 'permis_habiter':
        case 'contract':
        case 'rokhas':
        case 'archive':
            return 'open_module';
        default:
            return 'open_module';
    }
}

export function getModuleRoute(stepKey: string, dossierId: number): string {
    switch (stepKey) {
        case 'contract':
            return `/contracts?dossier_id=${dossierId}`;
        case 'rokhas':
            return `/dossiers/${dossierId}`;
        case 'archive':
            return `/archives?dossier_id=${dossierId}`;
        case 'cahier_chantier':
            return `/dossiers/${dossierId}?tab=workflow`;
        default:
            return `/documents?dossier_id=${dossierId}`;
    }
}
