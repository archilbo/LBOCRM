import { useEffect, useMemo } from 'react';
import { AppCard } from '@/components/ui/AppCard';
import { AppSelect } from '@/components/ui/AppSelect';
import type { ClientOption, DossierOption } from '@/features/finance/types';

type FinanceClientDossierFieldsProps = {
    clientId: string;
    dossierId: string;
    clients: ClientOption[];
    dossiers: DossierOption[];
    onClientChange: (clientId: string) => void;
    onDossierChange: (dossierId: string) => void;
};

export function FinanceClientDossierFields({
    clientId,
    dossierId,
    clients,
    dossiers,
    onClientChange,
    onDossierChange,
}: FinanceClientDossierFieldsProps) {
    const selectedDossier = useMemo(
        () => dossiers.find((dossier) => dossier.id === dossierId) || null,
        [dossiers, dossierId],
    );

    useEffect(() => {
        if (selectedDossier?.clientId && selectedDossier.clientId !== clientId) {
            onClientChange(selectedDossier.clientId);
        }
    }, [clientId, onClientChange, selectedDossier]);

    return (
        <div className="grid gap-3 lg:grid-cols-2">
            <AppSelect
                label="Client"
                placeholder="Selectionner un client"
                options={clients}
                selectedKey={clientId || null}
                onSelectionChange={(key) => onClientChange(key ? String(key) : '')}
            />
            <AppSelect
                label="Dossier"
                placeholder="Selectionner un dossier"
                options={dossiers}
                selectedKey={dossierId || null}
                onSelectionChange={(key) => onDossierChange(key ? String(key) : '')}
            />
            {selectedDossier ? (
                <AppCard className="p-3 lg:col-span-2">
                    <div className="grid gap-2 text-xs text-[var(--text-muted)] sm:grid-cols-3">
                        <p><span className="font-semibold text-[var(--text)]">Projet:</span> {selectedDossier.projectObject || '-'}</p>
                        <p><span className="font-semibold text-[var(--text)]">Adresse:</span> {selectedDossier.address || '-'}</p>
                        <p><span className="font-semibold text-[var(--text)]">Surface:</span> {selectedDossier.floorArea || selectedDossier.landSurface || '-'} m2</p>
                    </div>
                </AppCard>
            ) : null}
        </div>
    );
}
