import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';

type KeyedFlash = {
    key: string;
    values?: Record<string, string | number>;
};

type FlashMessage = string | KeyedFlash | null;

type FlashPayload = {
    success?: FlashMessage;
    error?: FlashMessage;
    warning?: FlashMessage;
    info?: FlashMessage;
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

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

function resolveMessage(message: FlashMessage | undefined, t: TranslateFn): string | undefined {
    if (!message) {
        return undefined;
    }

    if (typeof message === 'object') {
        return t(message.key, message.values);
    }

    return message;
}

function showFlash(flash: FlashPayload | undefined, t: TranslateFn) {
    if (!flash) {
        return;
    }

    const success = resolveMessage(flash.success, t);
    const error = resolveMessage(flash.error, t);
    const warning = resolveMessage(flash.warning, t);
    const info = resolveMessage(flash.info, t);

    if (success) {
        toast.success(success);
    }

    if (error) {
        toast.error(error);
    }

    if (warning) {
        toast.warning(warning);
    }

    if (info) {
        toast.info(info);
    }
}

export function AppFlashToasts() {
    const { t } = useTranslation();

    useEffect(() => {
        const removeSuccessListener = router.on('success', (event) => {
            const inertiaEvent = event as unknown as InertiaSuccessEvent;
            showFlash(inertiaEvent.detail?.page?.props?.flash, t);
        });

        return () => {
            removeSuccessListener();
        };
    }, [t]);

    return null;
}
