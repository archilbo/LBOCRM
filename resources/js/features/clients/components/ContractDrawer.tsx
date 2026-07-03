import type { Key } from 'react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextarea } from '@/components/ui/AppTextarea';
import { useTranslation } from '@/lib/i18n';
import type { ClientSelectedProjectWorkspace } from '@/features/clients/types';

type Props = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    project: ClientSelectedProjectWorkspace | null;
    clientId: number;
};

const MODE_OPTIONS = [
    { id: 'percentage' as Key, label: 'Percentage' },
    { id: 'forfait' as Key, label: 'Forfait' },
];

const RATE_OPTIONS = [
    { id: '0.5' as Key, label: '0.5%' },
    { id: '2.0' as Key, label: '2.0%' },
];

export function ContractDrawer({ isOpen, onOpenChange, project, clientId }: Props) {
    const { t } = useTranslation();
    const formRef = useRef<HTMLFormElement>(null);
    const [surface, setSurface] = useState('');
    const [pricePerM2, setPricePerM2] = useState('');
    const [mode, setMode] = useState<Key>('percentage');
    const [feeRate, setFeeRate] = useState<Key>('0.5');
    const [forfait, setForfait] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const existingContract = project?.contract;

    useEffect(() => {
        if (!isOpen) return;
        if (existingContract) {
            setSurface(existingContract.surface != null ? String(existingContract.surface) : '');
            setPricePerM2(existingContract.pricePerSquareMeter != null ? String(existingContract.pricePerSquareMeter) : '');
            setMode(existingContract.calculationMode === 'forfait' ? 'forfait' : 'percentage');
            setFeeRate(existingContract.feeRatePercent === 2 ? '2.0' : '0.5');
            setForfait(existingContract.forfaitTtc != null ? String(existingContract.forfaitTtc) : '');
            setNotes(existingContract.notes ?? '');
        } else {
            setSurface(String(project?.floorArea ?? ''));
            setPricePerM2('900');
            setMode('percentage');
            setFeeRate('0.5');
            setForfait('');
            setNotes('');
        }
    }, [isOpen, existingContract, project]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!project) return;
        setSubmitting(true);

        const payload: Record<string, unknown> = {
            dossier_id: project.id,
            surface: surface || null,
            price_per_square_meter: pricePerM2 || null,
            calculation_mode: mode === 'forfait' ? 'forfait' : 'percentage',
            notes: notes || null,
        };

        if (mode === 'percentage') {
            payload.fee_rate_percent = feeRate === '2.0' ? 2.0 : 0.5;
        } else {
            payload.forfait_ttc = forfait || null;
        }

        const returnUrl = `/clients/${clientId}?tab=workflow&dossier_id=${project.id}`;
        payload.return_to = returnUrl;

        const isUpdate = !!existingContract;
        const method = isUpdate ? 'put' as const : 'post' as const;
        const url = isUpdate ? `/contracts/${existingContract!.id}` : '/contracts';

        router[method](url, payload, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isUpdate ? 'Contract updated.' : 'Contract created.');
                onOpenChange(false);
            },
            onError: (errors) => {
                toast.error(Object.values(errors).join(', ') || 'Failed to save contract.');
            },
            onFinish: () => setSubmitting(false),
        });
    }

    if (!project) return null;

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={existingContract ? 'Edit contract' : 'Create contract'}
            description={`${project.dossierNumber} \u2014 ${project.projectObject || ''}`}
            footer={(
                <div className="flex items-center justify-end gap-2">
                    <AppButton variant="bordered" onPress={() => onOpenChange(false)}>
                        {t('clients.cancel')}
                    </AppButton>
                    <AppButton variant="solid" isLoading={submitting} onPress={() => formRef.current?.requestSubmit()}>
                        {existingContract ? t('clients.save') : t('clients.create')}
                    </AppButton>
                </div>
            )}
        >
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 p-5">
                {existingContract && (
                    <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-[12px]">
                        <span className="font-medium text-[var(--text-muted)]">{t('workflow.contractNumber')}:</span>
                        <span className="font-semibold text-[var(--foreground)]">{existingContract.number}</span>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                    <AppInput label={t('workflow.surface')} type="number" value={surface} onChange={setSurface} placeholder="e.g. 280" labelExtra="m\u00B2" />
                    <AppInput label={t('workflow.unitPrice')} type="number" value={pricePerM2} onChange={setPricePerM2} placeholder="900" isDisabled={mode === 'forfait'} labelExtra="MAD/m\u00B2" />
                </div>

                <AppSelect label={t('workflow.calculationMode')} options={MODE_OPTIONS} selectedKey={mode} onSelectionChange={setMode} />

                {mode === 'percentage' ? (
                    <AppSelect label={t('workflow.feeRate')} options={RATE_OPTIONS} selectedKey={feeRate} onSelectionChange={setFeeRate} />
                ) : (
                    <AppInput label={t('workflow.forfaitAmount')} type="number" value={forfait} onChange={setForfait} placeholder="e.g. 50000" labelExtra="MAD" />
                )}

                <AppTextarea label={t('workflow.notes')} value={notes} onChange={setNotes} placeholder={t('workflow.notesPlaceholder')} />
            </form>
        </AppDrawer>
    );
}
