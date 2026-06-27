import { Monitor, RefreshCw } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';

export function TemplatePreviewPanel({ html, onRefresh }: { html: string; onRefresh: () => void }) {
    return (
        <AppCard className="p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Monitor size={15} className="text-[var(--accent)]" />
                    <h2 className="text-sm font-semibold">Preview</h2>
                </div>
                <AppButton size="sm" variant="secondary" onPress={onRefresh}><RefreshCw size={14} /> Exact</AppButton>
            </div>
            <div className="overflow-auto rounded-2xl border bg-neutral-200 p-2 dark:bg-neutral-900">
                <iframe title="Template preview" srcDoc={html} sandbox="" className="h-[560px] w-full rounded-xl bg-white shadow" />
            </div>
        </AppCard>
    );
}
