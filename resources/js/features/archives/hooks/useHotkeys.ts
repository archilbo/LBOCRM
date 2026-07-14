import { useEffect } from 'react';

type HotkeyDef = {
    key: string;
    meta?: boolean;
    shift?: boolean;
    handler: () => void;
};

export function useHotkeys(hotkeys: HotkeyDef[]) {
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            // Don't trigger in inputs
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
                if (e.key === 'Escape') {
                    // Allow escape
                } else {
                    return;
                }
            }

            for (const hk of hotkeys) {
                const metaMatch = hk.meta ? (e.metaKey || e.ctrlKey) : !(e.metaKey || e.ctrlKey);
                const shiftMatch = hk.shift ? e.shiftKey : !e.shiftKey;
                if (metaMatch && shiftMatch && e.key.toLowerCase() === hk.key.toLowerCase()) {
                    e.preventDefault();
                    hk.handler();
                    return;
                }
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [hotkeys]);
}
