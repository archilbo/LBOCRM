import {
    ChevronDown,
    Copy,
    History,
    MoreHorizontal,
    Plus,
    RefreshCcw,
    Save,
    Sparkles,
    Star,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { FinanceDocumentType } from '@/features/finance/types';

type TemplateToolbarProps = {
    selectedType: FinanceDocumentType;
    documentTypes: Array<{ type: FinanceDocumentType; label: string }>;
    typeCounts: Record<string, number>;
    onSelectType: (type: FinanceDocumentType) => void;
    templatesTotal: number;
    variablesTotal: number;
    draftName?: string;
    dirty: boolean;
    onNew: () => void;
    onSave: () => void;
    onExactPreview: () => void;
    onVersions?: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onSetDefault: () => void;
    onResetDefault: () => void;
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
    onNew,
    onSave,
    onExactPreview,
    onVersions,
    onDuplicate,
    onDelete,
    onSetDefault,
    onResetDefault,
}: TemplateToolbarProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-4">
            <div className="flex min-w-0 items-center gap-3">
                <span className="text-sm font-semibold text-[var(--text)]">Templates</span>

                <div className="flex items-center gap-1 rounded-lg bg-[var(--surface-2)] p-0.5">
                    {documentTypes.map((item) => {
                        const active = item.type === selectedType;
                        return (
                            <button
                                key={item.type}
                                type="button"
                                onClick={() => onSelectType(item.type)}
                                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                    active
                                        ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                                }`}
                            >
                                {item.label}
                                <span className="ml-1.5 text-[10px] text-[var(--text-muted)]">
                                    {typeCounts[item.type] ?? 0}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <span className="text-xs text-[var(--text-muted)]">
                    {templatesTotal} template{templatesTotal !== 1 ? 's' : ''} · {variablesTotal} variables
                </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                {draftName ? (
                    <>
                        <button type="button" onClick={onNew} className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)]">
                            <Plus size={14} />
                            New
                        </button>

                        <button
                            type="button"
                            onClick={onSave}
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-2.5 text-xs font-medium text-black transition hover:opacity-90 disabled:opacity-40"
                        >
                            <Save size={14} />
                            Save
                        </button>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((v) => !v)}
                                className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                            >
                                <MoreHorizontal size={14} />
                            </button>
                            {menuOpen ? (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                                    <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl">
                                        <MenuButton icon={Sparkles} label="Exact preview" onClick={() => { setMenuOpen(false); onExactPreview(); }} />
                                        {onVersions ? (
                                            <MenuButton icon={History} label="Versions" onClick={() => { setMenuOpen(false); onVersions(); }} />
                                        ) : null}
                                        <MenuButton icon={Star} label="Set as default" onClick={() => { setMenuOpen(false); onSetDefault(); }} />
                                        <MenuButton icon={Copy} label="Duplicate" onClick={() => { setMenuOpen(false); onDuplicate(); }} />
                                        <MenuButton icon={RefreshCcw} label="Reset default" onClick={() => { setMenuOpen(false); onResetDefault(); }} />
                                        <div className="my-1 border-t border-[var(--border)]" />
                                        <MenuButton icon={Trash2} label="Delete" onClick={() => { setMenuOpen(false); onDelete(); }} danger />
                                    </div>
                                </>
                            ) : null}
                        </div>

                        <span
                            className={`flex items-center gap-1 text-xs ${
                                dirty ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                        >
                            <span className={`inline-block size-1.5 rounded-full ${dirty ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                            {dirty ? 'Unsaved' : 'Saved'}
                        </span>
                    </>
                ) : (
                    <button type="button" onClick={onNew} className="flex h-8 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 text-xs font-medium text-black transition hover:opacity-90">
                        <Plus size={14} />
                        New template
                    </button>
                )}
            </div>
        </div>
    );
}

function MenuButton({
    icon: Icon,
    label,
    onClick,
    danger,
}: {
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition ${
                danger ? 'text-red-400 hover:bg-red-500/10' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
            }`}
        >
            <Icon size={14} />
            {label}
        </button>
    );
}

export default TemplateToolbar;
