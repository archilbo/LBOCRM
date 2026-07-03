import { useMemo, useState } from 'react';
import { Calculator, Lock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppTextField } from '@/components/ui/AppTextField';
import { formatMoney } from '@/features/contracts/data/mockContracts';
import { useTranslation } from '@/lib/i18n';

function toNumber(value: string) {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
}

export function ContractCalculationPanel() {
    const { t } = useTranslation();

    const [surface, setSurface] = useState('280');
    const [pricePerMeter, setPricePerMeter] = useState('120');
    const [honorairesRate, setHonorairesRate] = useState('2');
    const [tvaRate, setTvaRate] = useState('20');

    const result = useMemo(() => {
        const floorArea = toNumber(surface);
        const price = toNumber(pricePerMeter);
        const rate = toNumber(honorairesRate);
        const tva = toNumber(tvaRate);

        const estimation = floorArea * price;
        const ht = estimation / (1 + tva / 100);
        const tvaAmount = ht * (tva / 100);
        const ttc = ht + tvaAmount;

        return {
            estimation,
            ht,
            tvaAmount,
            ttc,
            rate,
        };
    }, [honorairesRate, pricePerMeter, surface, tvaRate]);

    return (
        <AppCard className="p-5">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                            <Calculator size={17} />
                        </div>
                        <h2 className="text-sm font-semibold">{t('contractsWorkspace.calculator.title')}</h2>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
                        {t('contractsWorkspace.calculator.description')}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <AppButton
                        size="sm"
                        variant="secondary"
                        onPress={() => {
                            setSurface('280');
                            setPricePerMeter('120');
                            setHonorairesRate('2');
                            setTvaRate('20');
                            toast.info(t('contractsWorkspace.toast.reset'));
                        }}
                    >
                        <RotateCcw size={15} />
                        {t('contractsWorkspace.calculator.reset')}
                    </AppButton>

                    <AppButton
                        size="sm"
                        variant="primary"
                        onPress={() => toast.success(t('contractsWorkspace.toast.lock'))}
                    >
                        <Lock size={15} />
                        {t('contractsWorkspace.calculator.lock')}
                    </AppButton>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <AppTextField
                    label={t('contractsWorkspace.calculator.surface')}
                    value={surface}
                    onChange={setSurface}
                />

                <AppTextField
                    label={t('contractsWorkspace.calculator.pricePerMeter')}
                    value={pricePerMeter}
                    onChange={setPricePerMeter}
                />

                <AppTextField
                    label={t('contractsWorkspace.calculator.honorairesRate')}
                    value={honorairesRate}
                    onChange={setHonorairesRate}
                />

                <AppTextField
                    label={t('contractsWorkspace.calculator.tvaRate')}
                    value={tvaRate}
                    onChange={setTvaRate}
                />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border bg-[var(--surface-2)] p-4">
                    <p className="text-xs text-[var(--text-muted)]">{t('contractsWorkspace.calculator.estimation')}</p>
                    <p className="mt-1 text-lg font-semibold">{formatMoney(result.estimation)}</p>
                </div>

                <div className="rounded-2xl border bg-[var(--surface-2)] p-4">
                    <p className="text-xs text-[var(--text-muted)]">{t('contractsWorkspace.calculator.ht')}</p>
                    <p className="mt-1 text-lg font-semibold">{formatMoney(result.ht)}</p>
                </div>

                <div className="rounded-2xl border bg-[var(--surface-2)] p-4">
                    <p className="text-xs text-[var(--text-muted)]">{t('contractsWorkspace.calculator.tvaAmount')}</p>
                    <p className="mt-1 text-lg font-semibold">{formatMoney(result.tvaAmount)}</p>
                </div>

                <div className="rounded-2xl border bg-[color-mix(in_srgb,var(--accent)_9%,var(--surface))] p-4">
                    <p className="text-xs text-[var(--accent)]">{t('contractsWorkspace.calculator.ttc')}</p>
                    <p className="mt-1 text-lg font-semibold text-[var(--accent)]">{formatMoney(result.ttc)}</p>
                </div>
            </div>
        </AppCard>
    );
}
