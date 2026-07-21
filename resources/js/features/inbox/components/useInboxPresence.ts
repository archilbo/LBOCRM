import { echo } from '@laravel/echo-react';
import { useEffect, useState } from 'react';

type PresenceUser = { id: number; name: string };

export function useInboxPresence(companyId?: number | null): Set<number> {
    const [onlineIds, setOnlineIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!companyId) return;
        const channelName = `company.${companyId}.presence`;
        const channel = echo().join(channelName);
        channel
            .here((users: PresenceUser[]) => setOnlineIds(new Set(users.map((user) => Number(user.id)))))
            .joining((user: PresenceUser) => setOnlineIds((current) => new Set(current).add(Number(user.id))))
            .leaving((user: PresenceUser) => setOnlineIds((current) => {
                const next = new Set(current);
                next.delete(Number(user.id));
                return next;
            }));

        return () => {
            echo().leave(channelName);
            setOnlineIds(new Set());
        };
    }, [companyId]);

    return onlineIds;
}
