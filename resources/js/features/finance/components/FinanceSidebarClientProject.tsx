import { router } from '@inertiajs/react';
import { FileText, UserRound } from 'lucide-react';
import type { FinanceDocument } from '@/features/finance/types';

type FinanceSidebarClientProjectProps = {
    document: FinanceDocument;
};

export function FinanceSidebarClientProject({ document }: FinanceSidebarClientProjectProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                <UserRound size={14} className="text-[var(--text-muted)]" />
                <h2 className="text-xs font-semibold text-[var(--foreground)]">Client &amp; project</h2>
            </div>

            {/* Data rows */}
            <div className="divide-y divide-[var(--border)] text-xs">
                <div className="grid grid-cols-3 items-baseline gap-2 px-4 py-2.5">
                    <span className="text-[var(--text-muted)]">Client</span>
                    <span className="col-span-2 truncate text-right font-semibold text-[var(--foreground)]">
                        {document.client?.name || '-'}
                    </span>
                </div>
                <div className="grid grid-cols-3 items-baseline gap-2 px-4 py-2.5">
                    <span className="text-[var(--text-muted)]">CIN</span>
                    <span className="col-span-2 truncate text-right font-mono text-zinc-300">
                        {document.client?.cin || '-'}
                    </span>
                </div>
                <div className="grid grid-cols-3 items-baseline gap-2 px-4 py-2.5">
                    <span className="text-[var(--text-muted)]">Dossier</span>
                    <span className="col-span-2 truncate text-right font-mono text-zinc-300">
                        {document.dossier?.number || '-'}
                    </span>
                </div>
                <div className="grid grid-cols-3 items-baseline gap-2 px-4 py-2.5">
                    <span className="text-[var(--text-muted)]">Project</span>
                    <span className="col-span-2 truncate text-right font-semibold text-[var(--foreground)]">
                        {document.dossier?.projectObject || '-'}
                    </span>
                </div>
            </div>

            {/* Utility footer */}
            <div className="flex gap-2 border-t border-[var(--border)] p-3">
                <button
                    type="button"
                    onClick={() => document.client?.id ? router.visit(`/clients/${document.client.id}`) : router.visit('/clients')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 text-xs text-[var(--text-muted)] transition-all hover:border-zinc-700 hover:text-amber-500"
                >
                    <UserRound size={13} />
                    View Client
                </button>
                <button
                    type="button"
                    onClick={() => document.dossier?.id ? router.visit(`/dossiers/${document.dossier.id}`) : router.visit('/dossiers')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 text-xs text-[var(--text-muted)] transition-all hover:border-zinc-700 hover:text-amber-500"
                >
                    <FileText size={13} />
                    View Project
                </button>
            </div>
        </div>
    );
}
