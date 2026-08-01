import { Dropdown } from '@heroui/react';
import {
    Copy,
    History,
    LoaderCircle,
    MoreHorizontal,
    Pencil,
    Plus,
    Save,
    Star,
    Trash2,
    X,
} from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import type { FinanceDocumentType } from '@/features/finance/types';

type TemplateActionId = 'versions' | 'default' | 'rename' | 'duplicate' | 'delete';

type TemplateToolbarProps = {
    selectedType: FinanceDocumentType;
    documentTypes: Array<{ type: FinanceDocumentType; label: string }>;
    typeCounts: Record<string, number>;
    onSelectType: (type: FinanceDocumentType) => void;
    templatesTotal: number;
    variablesTotal: number;
    draftName?: string;
    dirty: boolean;
    saving: boolean;
    onNew: () => void;
    onSave: () => void;
    onVersions?: () => void;
    onDuplicate: () => void;
    onRename: () => void;
    onDelete: () => void;
    onSetDefault: () => void;
    onClose: () => void;
};

export function TemplateToolbar({
    selectedType,
    documentTypes,
    typeCounts,
    onSelectType,
    templatesTotal,
    variablesTotal,
    draftName,
    dirty,
    saving,
    onNew,
    onSave,
    onVersions,
    onDuplicate,
    onRename,
    onDelete,
    onSetDefault,
    onClose,
}: TemplateToolbarProps) {
    function handleAction(action: TemplateActionId) {
        const actions: Record<TemplateActionId, (() => void) | undefined> = {
            versions: onVersions,
            default: onSetDefault,
            rename: onRename,
            duplicate: onDuplicate,
            delete: onDelete,
        };
        actions[action]?.();
    }

    return (
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-3 lg:px-4">
            <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                <span className="hidden shrink-0 text-sm font-semibold text-[var(--text)] sm:inline">Templates</span>

                <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-lg bg-[var(--surface-2)] p-0.5">
                    {documentTypes.map((item) => {
                        const active = item.type === selectedType;
                        return (
                            <AppButton
                                key={item.type}
                                size="sm"
                                variant={active ? 'secondary' : 'ghost'}
                                onPress={() => onSelectType(item.type)}
                                className={`h-7 min-w-0 shrink-0 rounded-md px-2.5 text-xs ${active ? 'text-[var(--accent)] shadow-sm' : 'text-[var(--text-muted)]'}`}
                            >
                                {item.label}
                                <span className="text-[9px] tabular-nums text-[var(--text-muted)]">{typeCounts[item.type] ?? 0}</span>
                            </AppButton>
                        );
                    })}
                </div>

                <span className="hidden shrink-0 text-[10px] text-[var(--text-muted)] 2xl:inline">
                    {templatesTotal} template{templatesTotal !== 1 ? 's' : ''} / {variablesTotal} variables
                </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
                {draftName ? (
                    <>
                        <AppButton size="sm" variant="outline" onPress={onNew} className="h-8 px-2.5 text-xs">
                            <Plus size={14} />
                            <span className="hidden sm:inline">Nouveau</span>
                        </AppButton>

                        <AppButton
                            size="sm"
                            variant="primary"
                            onPress={onSave}
                            isDisabled={!dirty || saving}
                            className="h-8 px-2.5 text-xs"
                            aria-label="Enregistrer le template (Ctrl+S)"
                        >
                            {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
                            <span className="hidden sm:inline">{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                        </AppButton>

                        <Dropdown>
                            <Dropdown.Trigger
                                className="flex size-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] outline-none transition hover:bg-[var(--surface-2)] hover:text-[var(--text)] data-[open]:border-[var(--accent)] data-[open]:text-[var(--accent)]"
                                aria-label="Actions du template"
                            >
                                <MoreHorizontal size={14} />
                            </Dropdown.Trigger>
                            <Dropdown.Popover placement="bottom end" className="min-w-48 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                                <Dropdown.Menu
                                    aria-label="Actions du template"
                                    onAction={(key) => handleAction(String(key) as TemplateActionId)}
                                    className="outline-none"
                                >
                                    <Dropdown.Item id="versions" isDisabled={!onVersions} textValue="Versions" className="rounded-md px-2.5 py-2 text-xs font-medium text-[var(--text)] outline-none data-[hover]:bg-[var(--surface-2)] data-[disabled]:opacity-40">
                                        <div className="flex items-center gap-2"><History size={14} /><span>Versions</span></div>
                                    </Dropdown.Item>
                                    <Dropdown.Item id="default" textValue="Definir par defaut" className="rounded-md px-2.5 py-2 text-xs font-medium text-[var(--text)] outline-none data-[hover]:bg-[var(--surface-2)]">
                                        <div className="flex items-center gap-2"><Star size={14} /><span>Definir par defaut</span></div>
                                    </Dropdown.Item>
                                    <Dropdown.Item id="rename" textValue="Renommer" className="rounded-md px-2.5 py-2 text-xs font-medium text-[var(--text)] outline-none data-[hover]:bg-[var(--surface-2)]">
                                        <div className="flex items-center gap-2"><Pencil size={14} /><span>Renommer</span></div>
                                    </Dropdown.Item>
                                    <Dropdown.Item id="duplicate" textValue="Dupliquer" className="rounded-md px-2.5 py-2 text-xs font-medium text-[var(--text)] outline-none data-[hover]:bg-[var(--surface-2)]">
                                        <div className="flex items-center gap-2"><Copy size={14} /><span>Dupliquer</span></div>
                                    </Dropdown.Item>
                                    <Dropdown.Section className="mt-1 border-t border-[var(--border)] pt-1">
                                        <Dropdown.Item id="delete" textValue="Supprimer" className="rounded-md px-2.5 py-2 text-xs font-medium text-[var(--danger)] outline-none data-[hover]:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]">
                                            <div className="flex items-center gap-2"><Trash2 size={14} /><span>Supprimer</span></div>
                                        </Dropdown.Item>
                                    </Dropdown.Section>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>

                        <span
                            className={`hidden items-center gap-1 text-[9px] lg:flex ${saving ? 'text-[var(--accent)]' : dirty ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}
                        >
                            <span className={`size-1.5 rounded-full ${saving ? 'animate-pulse bg-[var(--accent)]' : dirty ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'}`} />
                            {saving ? 'Enregistrement' : dirty ? 'Non enregistre' : 'Enregistre'}
                        </span>
                    </>
                ) : (
                    <AppButton size="sm" variant="primary" onPress={onNew} className="h-8 px-3 text-xs">
                        <Plus size={14} /> Nouveau template
                    </AppButton>
                )}

                <div className="ml-0.5 h-5 w-px bg-[var(--border)]" />
                <AppButton
                    size="sm"
                    variant="ghost"
                    onPress={onClose}
                    className="size-8 min-w-0 text-[var(--text-muted)]"
                    aria-label="Fermer l editeur de templates"
                >
                    <X size={15} />
                </AppButton>
            </div>
        </div>
    );
}

export default TemplateToolbar;
