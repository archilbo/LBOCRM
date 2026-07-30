import { useCallback, useMemo } from 'react';
import { usePage } from '@inertiajs/react';

type AuthUser = {
    permissions?: string[];
};

export function usePermissions() {
    const page = usePage();
    const permissions = useMemo(
        () => new Set(((page.props as { auth?: { user?: AuthUser | null } }).auth?.user?.permissions) ?? []),
        [page.props],
    );

    const can = useCallback((permission: string) => permissions.has(permission), [permissions]);
    const canAny = useCallback((requiredPermissions: string[]) => requiredPermissions.some(can), [can]);

    return { can, canAny, permissions };
}
