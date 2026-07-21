import { echo } from '@laravel/echo-react';
import { useEffect, useState } from 'react';

export type RealtimeState = 'connected' | 'connecting' | 'disconnected';

type Connection = {
    state?: string;
    bind: (event: string, callback: (change: { current?: string }) => void) => void;
    unbind: (event: string, callback: (change: { current?: string }) => void) => void;
};

function normalize(state?: string): RealtimeState {
    if (state === 'connected') return 'connected';
    if (state === 'connecting' || state === 'initialized') return 'connecting';
    return 'disconnected';
}

export function useRealtimeConnection(): RealtimeState {
    const [state, setState] = useState<RealtimeState>('connecting');

    useEffect(() => {
        const connector = echo().connector as unknown as { pusher?: { connection?: Connection } };
        const connection = connector.pusher?.connection;
        if (!connection) return;
        setState(normalize(connection.state));
        const handleChange = (change: { current?: string }) => setState(normalize(change.current));
        connection.bind('state_change', handleChange);
        return () => connection.unbind('state_change', handleChange);
    }, []);

    return state;
}
