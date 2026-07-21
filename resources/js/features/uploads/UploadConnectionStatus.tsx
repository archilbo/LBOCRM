import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function UploadConnectionStatus() {
    const [online, setOnline] = useState(navigator.onLine);

    useEffect(() => {
        const go = () => setOnline(true);
        const gone = () => setOnline(false);
        window.addEventListener('online', go);
        window.addEventListener('offline', gone);
        return () => {
            window.removeEventListener('online', go);
            window.removeEventListener('offline', gone);
        };
    }, []);

    if (online) return null;

    return (
        <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 shadow-lg backdrop-blur-sm">
            <WifiOff size={14} />
            <span>No internet connection. Uploads will resume when connected.</span>
        </div>
    );
}
