import { router } from '@inertiajs/react';
import { Archive, BadgeDollarSign, FileCheck2, FileText, FolderPlus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { useTranslation } from '@/lib/i18n';

export function DashboardQuickActions() {
    const { t } = useTranslation();

    function go(href: string) {
        toast.success(t('dashboardHome.toast.quickAction'));
        router.visit(href);
    }

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <AppButton size="sm" variant="secondary" onPress={() => go('/clients')}>
                <UserPlus size={15} />
                {t('dashboardHome.quick.newClient')}
            </AppButton>

            <AppButton size="sm" variant="secondary" onPress={() => go('/dossiers')}>
                <FolderPlus size={15} />
                {t('dashboardHome.quick.newProject')}
            </AppButton>

            <AppButton size="sm" variant="secondary" onPress={() => go('/documents')}>
                <FileCheck2 size={15} />
                {t('dashboardHome.quick.uploadDocument')}
            </AppButton>

            <AppButton size="sm" variant="secondary" onPress={() => go('/contracts')}>
                <FileText size={15} />
                {t('dashboardHome.quick.generateContract')}
            </AppButton>

            <AppButton size="sm" variant="secondary" onPress={() => go('/finance')}>
                <BadgeDollarSign size={15} />
                {t('dashboardHome.quick.addPayment')}
            </AppButton>

            <AppButton size="sm" variant="secondary" onPress={() => go('/archives')}>
                <Archive size={15} />
                {t('dashboardHome.quick.archiveFile')}
            </AppButton>
        </div>
    );
}
