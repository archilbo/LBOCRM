import { Monitor, RefreshCw } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';

export function TemplatePreviewPanel({ html, onRefresh }: { html: string; onRefresh: () => void }) {
    return (
        <AppCard className="p-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                    <Monitor size={14} className="text-[var(--accent)]" />
                    <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Preview</h2>
                </div>
                <AppButton size="sm" variant="secondary" onPress={onRefresh}><RefreshCw size={13} /> Exact</AppButton>
            </div>
            <div className="overflow-auto rounded-xl border bg-neutral-200 p-1.5 dark:bg-neutral-900">
                <iframe title="Template preview" srcDoc={html} sandbox="" className="h-[480px] w-full rounded-lg bg-white shadow-sm" />
            </div>
        </AppCard>
    );
}
