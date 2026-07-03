import { CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { useTranslation } from '@/lib/i18n';

type ChecklistItem = {
    labelKey: string;
    status: 'done' | 'pending' | 'blocked';
};

const items: ChecklistItem[] = [
    {
        labelKey: 'documentsWorkspace.checklist.cni',
        status: 'done',
    },
    {
        labelKey: 'documentsWorkspace.checklist.ownership',
        status: 'pending',
    },
    {
        labelKey: 'documentsWorkspace.checklist.cadastral',
        status: 'blocked',
    },
    {
        labelKey: 'documentsWorkspace.checklist.surface',
        status: 'blocked',
    },
    {
        labelKey: 'documentsWorkspace.checklist.contractReady',
        status: 'pending',
    },
];

export function DocumentChecklist() {
    const { t } = useTranslation();

    return (
        <AppCard className="p-5">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('documentsWorkspace.checklist.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('documentsWorkspace.checklist.description')}
                </p>
            </div>

            <div className="space-y-3">
                {items.map((item) => {
                    const done = item.status === 'done';
                    const blocked = item.status === 'blocked';

                    return (
                        <div key={item.labelKey} className="flex items-center gap-3 rounded-2xl border bg-[var(--surface)] p-3">
                            {done ? (
                                <CheckCircle2 size={17} className="text-[var(--success)]" />
                            ) : blocked ? (
                                <AlertTriangle size={17} className="text-[var(--danger)]" />
                            ) : (
                                <Circle size={17} className="text-[var(--text-muted)]" />
                            )}

                            <p className="flex-1 text-sm font-medium">{t(item.labelKey)}</p>

                            <AppBadge tone={done ? 'green' : blocked ? 'red' : 'amber'}>
                                {done ? t('common.completed') : blocked ? t('common.blocked') : t('common.pending')}
                            </AppBadge>
                        </div>
                    );
                })}
            </div>
        </AppCard>
    );
}
