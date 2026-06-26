export type ClientStatus = 'active' | 'inactive' | 'archived';

export type ClientRow = {
    id: number;
    clientNumber: string;
    civility: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string;
    cin: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    fatherName: string | null;
    motherName: string | null;
    cniExpirationDate: string | null;
    intermediaryId: string;
    intermediaryName: string;
    status: ClientStatus;
    projectsCount: number;
    updatedAt: string | null;
    createdAt?: string | null;
    notes: string | null;
};

export type IntermediaryOption = {
    id: string;
    label: string;
};

export type ClientFormPayload = {
    firstName: string;
    lastName: string;
    cin: string;
    phone: string;
    email: string;
    address: string;
    fatherName: string;
    motherName: string;
    cniExpirationDate: string;
    intermediaryId: string;
    notes: string;
};