import { RefreshCw } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';

export function TemplatePreviewPanel({ html, onRefresh }: { html: string; onRefresh: () => void }) {
    return (
        <AppCard className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Preview</h2>
                <AppButton size="sm" variant="secondary" onPress={onRefresh}><RefreshCw size={14} /> Backend preview</AppButton>
            </div>
            <div className="overflow-auto rounded-2xl border bg-neutral-200 p-3 dark:bg-neutral-900">
                <iframe title="Template preview" srcDoc={html} sandbox="" className="h-[680px] w-full rounded-xl bg-white shadow" />
            </div>
        </AppCard>
    );
}
