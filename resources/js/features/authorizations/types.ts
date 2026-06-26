export type AuthorizationStatus =
    | 'not_started'
    | 'submitted'
    | 'observations'
    | 'approved'
    | 'received'
    | 'rejected'
    | string;

export type AuthorizationObservation = {
    text: string;
    created_at?: string;
};

export type AuthorizationRow = {
    id: number;
    dossierId: string;
    dossierNumber: string;
    projectObject: string;
    clientName: string;
    clientCin: string;

    authorizationNumber: string | null;
    submissionNumber: string | null;
    authorityName: string | null;
    authorityType: string | null;
    status: AuthorizationStatus;

    submittedAt: string | null;
    approvedAt: string | null;
    receivedAt: string | null;

    receiptPath: string | null;
    finalFilePath: string | null;
    observations: AuthorizationObservation[];
    observationsText: string;
    notes: string | null;

    updatedAt: string | null;
    createdAt: string | null;
};

export type AuthorizationDossierOption = {
    id: string;
    label: string;
    hasAuthorization: boolean;
};

export type AuthorizationFormPayload = {
    dossierId: string;
    authorizationNumber: string;
    submissionNumber: string;
    authorityName: string;
    authorityType: string;
    status: string;
    submittedAt: string;
    approvedAt: string;
    receivedAt: string;
    observationsText: string;
    notes: string;
};