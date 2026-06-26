import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export function prototypeNavigate(href: string, message = 'Opening page...') {
    toast.info(message);
    router.visit(href);
}

export function prototypeToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
    if (type === 'success') {
        toast.success(message);
        return;
    }

    if (type === 'error') {
        toast.error(message);
        return;
    }

    toast.info(message);
}

export function prototypeDownload(fileName: string, content = 'ARCHI LBO prototype file') {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${fileName}`);
}

export function prototypeNotReady(action = 'This action') {
    toast.info(`${action} will be connected after backend/database implementation.`);
}
