export type IntermediaryRow = {
    id: number;
    code: string;
    name: string;
    type: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
    isActive: boolean;
    clientsCount: number;
    createdAt: string | null;
    updatedAt: string | null;
};

export type IntermediaryFormPayload = {
    name: string;
    type: string;
    phone: string;
    email: string;
    notes: string;
    isActive: boolean;
};
