import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type FlashPayload = {
    success?: string | null;
    error?: string | null;
    warning?: string | null;
    info?: string | null;
};

type InertiaSuccessEvent = {
    detail?: {
        page?: {
            props?: {
                flash?: FlashPayload;
            };
        };
    };
};

function showFlash(flash?: FlashPayload) {
    if (!flash) {
        return;
    }

    if (flash.success) {
        toast.success(flash.success);
    }

    if (flash.error) {
        toast.error(flash.error);
    }

    if (flash.warning) {
        toast.warning(flash.warning);
    }

    if (flash.info) {
        toast.info(flash.info);
    }
}

export function AppFlashToasts() {
    useEffect(() => {
        const removeSuccessListener = router.on('success', (event) => {
            const inertiaEvent = event as unknown as InertiaSuccessEvent;
            showFlash(inertiaEvent.detail?.page?.props?.flash);
        });

        return () => {
            removeSuccessListener();
        };
    }, []);

    return null;
}