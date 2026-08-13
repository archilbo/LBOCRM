import { FormEvent, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppTextarea } from '@/components/ui/AppTextarea';
import { DateField } from '@/features/archives/components/DateField';
import { strToDate, dateToStr } from '@/lib/dateUtils';
import { useTranslation } from '@/lib/i18n';

type Props = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel: string;
    method: 'post' | 'put';
    url: string;
    dateFieldLabel?: string;
    dateFieldName?: string;
    showDateField?: boolean;
    extraPayload?: Record<string, unknown>;
    onSuccess?: () => void;
};

export function ConfirmActionModal({
    isOpen,
    onOpenChange,
    title,
    description,
    confirmLabel,
    method,
    url,
    dateFieldLabel,
    dateFieldName,
    showDateField = false,
    extraPayload,
    onSuccess,
}: Props) {
    const { t } = useTranslation();
    const formRef = useRef<HTMLFormElement>(null);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    function reset() {
        setDate(new Date().toISOString().slice(0, 10));
        setNotes('');
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setSubmitting(true);

        const payload: Record<string, unknown> = {
            ...(extraPayload ?? {}),
            notes: notes || null,
        };
        if (showDateField && dateFieldName) {
            payload[dateFieldName] = date;
        }

        router[method](url, payload as Record<string, string | number | boolean | null | undefined>, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(title);
                reset();
                onOpenChange(false);
                onSuccess?.();
            },
            onError: (errors) => {
                toast.error(Object.values(errors).join(', ') || 'Action failed.');
            },
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <AppModal
            isOpen={isOpen}
            onOpenChange={(open) => { if (!open) reset(); onOpenChange(open); }}
            title={title}
        >
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                {description && (
                    <p className="text-[12px] text-[var(--text-muted)]">{description}</p>
                )}
                {showDateField && (
                    <DateField
                        label={dateFieldLabel || t('workflow.date') || 'Date'}
                        value={strToDate(date)}
                        onChange={(d) => setDate(dateToStr(d))}
                    />
                )}
                <AppTextarea
                    label={t('workflow.notes') || 'Notes'}
                    placeholder={t('workflow.notesPlaceholder') || 'Optional notes...'}
                    value={notes}
                    onChange={setNotes}
                />
                <div className="flex justify-end gap-2 pt-2">
                    <AppButton variant="bordered" onPress={() => { reset(); onOpenChange(false); }}>
                        {t('clients.cancel')}
                    </AppButton>
                    <AppButton variant="solid" isLoading={submitting} onPress={() => formRef.current?.requestSubmit()}>
                        {confirmLabel}
                    </AppButton>
                </div>
            </form>
        </AppModal>
    );
}
