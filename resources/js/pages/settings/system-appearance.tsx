import { Head } from '@inertiajs/react';
import { AppShell } from '@/components/layout/AppShell';
import { SystemAppearancePanel, type SystemAppearancePermissions } from '@/components/settings/system-appearance-panel';
import type { PublicBrandingSettings } from '@/types/branding';

type PageProps = {
    branding: PublicBrandingSettings;
    permissions: SystemAppearancePermissions;
};

export default function SystemAppearance({ branding, permissions }: PageProps) {
    return (
        <>
            <Head title="Système & apparence" />
            <AppShell fullBleed>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
                    <div className="mx-auto w-full max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8">
                        <SystemAppearancePanel branding={branding} permissions={permissions} />
                    </div>
                </div>
            </AppShell>
        </>
    );
}
