import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ClientDrawer } from '@/components/drawers';
import type { ClientFormPayload } from '@/features/clients/types';
import type { FormErrors } from '@/lib/formErrors';

type Props = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

function payloadForClient(payload: ClientFormPayload) {
    return {
        client_type: payload.clientType,
        civility: payload.civility || null,
        first_name: payload.firstName || null,
        last_name: payload.lastName || null,
        company_name: payload.companyName || null,
        cin: payload.cin || null,
        ice: payload.ice || null,
        managers: payload.managers.filter(Boolean),
        phone: payload.phone || null,
        email: payload.email || null,
        address: payload.address || null,
        father_name: payload.fatherName || null,
        mother_name: payload.motherName || null,
        cni_expiration_date: payload.cniExpirationDate || null,
        status: 'active',
        notes: payload.notes || null,
    };
}

export function DashboardClientActionDrawer({ isOpen, onOpenChange }: Props) {
    const [errors, setErrors] = useState<FormErrors>({});

    function handleSubmit(payload: ClientFormPayload) {
        setErrors({});
        router.post('/clients', payloadForClient(payload), {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Client créé.');
            },
            onError: (nextErrors) => {
                setErrors(nextErrors as FormErrors);
                toast.error('Vérifiez les informations du client.');
            },
        });
    }

    return (
        <ClientDrawer
            isOpen={isOpen}
            mode="create"
            client={null}
            onOpenChange={onOpenChange}
            onSubmit={handleSubmit}
            errors={errors}
        />
    );
}
