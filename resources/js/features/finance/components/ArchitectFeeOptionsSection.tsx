import { router } from '@inertiajs/react';
import { IconEdit, IconFileTypeDoc, IconInfoCircle, IconPlus, IconStar } from '@tabler/icons-react';
import { useState } from 'react';
import { Button, Checkbox, Input, ListBox, Select, Switch } from '@heroui/react';
import { AppCard } from '@/components/ui/AppCard';
import { AppModal } from '@/components/ui/AppModal';

export type ArchitectFeeOptionSettings = {
    id: string;
    name: string;
    calculationType: 'percentage' | 'forfait';
    percentageRate: string | null;
    contractTemplateKey: string;
    contractTemplateName: string;
    templateDetected: boolean;
    isDefault: boolean;
    isActive: boolean;
};

type Props = {
    options: ArchitectFeeOptionSettings[];
    canManage: boolean;
};

const blank = { name: '', calculation_type: 'percentage', percentage_rate: '', contract_template_key: '', is_default: false, is_active: true };

function templateKey(type: string, rate: string): string {
    if (type === 'forfait') return 'forfait';
    const [integer, decimal = ''] = rate.replace(',', '.').split('.', 2);
    const normalizedInteger = integer.replace(/^0+(?=\d)/, '') || '0';
    const normalizedDecimal = decimal.replace(/0+$/, '');
    return normalizedDecimal ? `${normalizedInteger}_${normalizedDecimal}` : normalizedInteger;
}

function expectedFilename(type: string, rate: string): string {
    return `contrat_architecte_${templateKey(type, rate)}.docx`;
}

export function ArchitectFeeOptionsSection({ options, canManage }: Props) {
    const [editing, setEditing] = useState<ArchitectFeeOptionSettings | null>(null);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(blank);
    const hasPercentageRate = form.calculation_type === 'percentage' && form.percentage_rate.trim() !== '';
    const derivedTemplateKey = hasPercentageRate || form.calculation_type === 'forfait'
        ? templateKey(form.calculation_type, form.percentage_rate)
        : null;
    const derivedFilename = derivedTemplateKey ? expectedFilename(form.calculation_type, form.percentage_rate) : null;

    function start(option?: ArchitectFeeOptionSettings) {
        setEditing(option ?? null);
        setForm(option ? {
            name: option.name,
            calculation_type: option.calculationType,
            percentage_rate: option.percentageRate ?? '',
            contract_template_key: option.contractTemplateKey,
            is_default: option.isDefault,
            is_active: option.isActive,
        } : blank);
        setOpen(true);
    }

    function submit() {
        const payload = { ...form, percentage_rate: form.calculation_type === 'percentage' ? form.percentage_rate : null };
        const visit = editing
            ? router.put(`/finance/settings/architect-fee-options/${editing.id}`, payload, { preserveScroll: true, onSuccess: () => setOpen(false) })
            : router.post('/finance/settings/architect-fee-options', payload, { preserveScroll: true, onSuccess: () => setOpen(false) });
        void visit;
    }

    return (
        <AppCard className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-[var(--text)]">Honoraires architecte</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">Gérez les taux et le modèle de contrat associé.</p>
                </div>
                {canManage ? <Button size="sm" variant="primary" onPress={() => start()}><IconPlus size={14} /> Ajouter un taux</Button> : null}
            </div>

            {options.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">Aucun taux architecte configuré.</div>
            ) : (
                <div className="mt-4 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
                    {options.map((option) => (
                        <div key={option.id} className="flex flex-wrap items-center gap-3 px-3 py-3 sm:px-4">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-medium text-[var(--text)]">{option.name}</p>
                                    {option.isDefault ? <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">Par défaut</span> : null}
                                    {!option.isActive ? <span className="text-[10px] text-[var(--text-muted)]">Désactivé</span> : null}
                                </div>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">{option.calculationType === 'percentage' ? `Pourcentage · ${option.percentageRate ?? '0'} %` : 'Forfait · montant saisi par contrat'} · Modèle : {option.contractTemplateName}</p>
                                {!option.templateDetected ? <p className="mt-1 text-xs text-[var(--danger)]">Modèle absent : renommez ou ajoutez {option.contractTemplateName}.</p> : null}
                            </div>
                            {canManage ? <div className="flex items-center gap-1.5">
                                {!option.isDefault && option.isActive ? <Button isIconOnly size="sm" variant="ghost" aria-label="Définir par défaut" title="Définir par défaut" onPress={() => router.put(`/finance/settings/architect-fee-options/${option.id}/default`, {}, { preserveScroll: true })}><IconStar size={14} /></Button> : null}
                                <Button isIconOnly size="sm" variant="ghost" aria-label={`Modifier ${option.name}`} title="Modifier" onPress={() => start(option)}><IconEdit size={14} /></Button>
                                <Switch size="sm" isSelected={option.isActive} aria-label={`${option.isActive ? 'Désactiver' : 'Activer'} ${option.name}`} onChange={(isActive) => {
                                    if (!isActive) router.put(`/finance/settings/architect-fee-options/${option.id}/deactivate`, {}, { preserveScroll: true });
                                    else router.put(`/finance/settings/architect-fee-options/${option.id}`, { name: option.name, calculation_type: option.calculationType, percentage_rate: option.percentageRate, is_default: option.isDefault, is_active: true }, { preserveScroll: true });
                                }}>
                                    <Switch.Content><Switch.Control><Switch.Thumb /></Switch.Control></Switch.Content>
                                </Switch>
                            </div> : null}
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-4 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--accent)_32%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))]">
                <div className="flex items-start gap-3 px-4 py-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--accent)]"><IconFileTypeDoc size={17} /></div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--text)]">Comment nommer votre modèle DOCX</p>
                        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Utilisez toujours <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 font-semibold text-[var(--text)]">contrat_architecte_&lt;taux&gt;.docx</code>. Remplacez la virgule ou le point du taux par <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 font-semibold text-[var(--text)]">_</code>.</p>
                        <div className="mt-3 grid gap-2 text-xs md:grid-cols-3">
                            <div className="min-w-0 rounded-lg bg-[var(--surface)] px-3 py-2 text-[var(--text-muted)]"><span className="font-medium text-[var(--text)]">0,5 %</span><span className="mx-1.5">→</span><code className="break-all">contrat_architecte_0_5.docx</code></div>
                            <div className="min-w-0 rounded-lg bg-[var(--surface)] px-3 py-2 text-[var(--text-muted)]"><span className="font-medium text-[var(--text)]">1,25 %</span><span className="mx-1.5">→</span><code className="break-all">contrat_architecte_1_25.docx</code></div>
                            <div className="min-w-0 rounded-lg bg-[var(--surface)] px-3 py-2 text-[var(--text-muted)]"><span className="font-medium text-[var(--text)]">Forfait</span><span className="mx-1.5">→</span><code className="break-all">contrat_architecte_forfait.docx</code></div>
                        </div>
                    </div>
                    <IconInfoCircle size={16} className="shrink-0 text-[var(--accent)]" aria-hidden />
                </div>
            </div>

            <AppModal isOpen={open} onOpenChange={setOpen} title={editing ? 'Modifier le taux architecte' : 'Ajouter un taux architecte'}>
                <div className="space-y-5 pb-1">
                    <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs leading-5 text-[var(--text-muted)]">Créez une option réutilisable pour les nouveaux contrats. Le modèle DOCX est déduit automatiquement de son type et de son taux.</p>

                    <label className="block text-xs font-semibold text-[var(--text)]">Nom affiché <span className="text-[var(--danger)]">*</span>
                        <Input className="mt-1 w-full" value={form.name} placeholder="Ex. Honoraires 1,25 %" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                        <span className="mt-1 block font-normal text-[11px] text-[var(--text-muted)]">Ce nom est visible dans la liste et lors de la création d’un contrat.</span>
                    </label>

                    <div className="text-xs font-semibold text-[var(--text)]">Type de calcul <span className="text-[var(--danger)]">*</span>
                        <Select selectedKey={form.calculation_type} onSelectionChange={(key) => setForm((current) => ({ ...current, calculation_type: String(key), percentage_rate: key === 'forfait' ? '' : current.percentage_rate }))}>
                            <Select.Trigger className="mt-1 flex h-9 w-full items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"><Select.Value className="flex-1 text-left" /><Select.Indicator /></Select.Trigger>
                            <Select.Popover className="z-[130] w-[var(--trigger-width)] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1"><ListBox aria-label="Type de calcul"><ListBox.Item id="percentage" textValue="Pourcentage">Pourcentage</ListBox.Item><ListBox.Item id="forfait" textValue="Forfait">Forfait</ListBox.Item></ListBox></Select.Popover>
                        </Select>
                    </div>

                    {form.calculation_type === 'percentage' ? <label className="block text-xs font-semibold text-[var(--text)]">Taux (%) <span className="text-[var(--danger)]">*</span>
                        <Input className="mt-1 w-full" inputMode="decimal" value={form.percentage_rate} placeholder="Ex. 1,25" onChange={(event) => setForm((current) => ({ ...current, percentage_rate: event.target.value }))} />
                        <span className="mt-1 block font-normal text-[11px] text-[var(--text-muted)]">Vous pouvez utiliser une virgule ou un point.</span>
                    </label> : <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs leading-5 text-[var(--text-muted)]">Le montant forfaitaire est saisi pour chaque contrat. Aucun pourcentage n’est associé à cette option.</div>}

                    <div className="rounded-xl border border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] p-3">
                        <div className="flex items-start gap-2.5"><IconFileTypeDoc size={17} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden />
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-[var(--text)]">Modèle DOCX attendu</p>
                                {derivedFilename ? <><p className="mt-1 text-[11px] text-[var(--text-muted)]">Clé générée : <code className="font-semibold text-[var(--text)]">{derivedTemplateKey}</code></p><code className="mt-2 block break-all rounded-md bg-[var(--surface)] px-2 py-1.5 text-xs font-semibold text-[var(--accent)]">{derivedFilename}</code></> : <p className="mt-1 text-[11px] leading-5 text-[var(--text-muted)]">Saisissez un taux pour afficher automatiquement le nom du fichier à déposer.</p>}
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] px-3 py-2.5"><Checkbox isSelected={form.is_default} onChange={(isDefault) => setForm((current) => ({ ...current, is_default: isDefault }))}>
                        <Checkbox.Content><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><span><span className="block text-sm font-medium text-[var(--text)]">Définir comme taux par défaut</span><span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">Il sera présélectionné pour chaque nouveau contrat.</span></span></Checkbox.Content>
                    </Checkbox></div>
                    <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4"><Button variant="ghost" onPress={() => setOpen(false)}>Annuler</Button><Button variant="primary" onPress={submit}>Enregistrer le taux</Button></div>
                </div>
            </AppModal>
        </AppCard>
    );
}
