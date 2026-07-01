import { router } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextarea } from '@/components/ui/AppTextarea';
import { AppTextField } from '@/components/ui/AppTextField';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';

export type TaskRequestOption = {
    id: number;
    label: string;
    description?: string | null;
    clientId?: number | null;
};

export type TaskRequestOptions = {
    users: TaskRequestOption[];
    clients: TaskRequestOption[];
    dossiers: TaskRequestOption[];
};

type TaskRequestForm = {
    request_type: string;
    title: string;
    description: string;
    target_user_id: number | null;
    client_id: number | null;
    dossier_id: number | null;
};

type Props = {
    isOpen: boolean;
    requestTypes: string[];
    requestTypeLabels: Record<string, string>;
    options: TaskRequestOptions;
    onOpenChange: (open: boolean) => void;
};

const emptyForm: TaskRequestForm = {
    request_type: 'admin_help',
    title: '',
    description: '',
    target_user_id: null,
    client_id: null,
    dossier_id: null,
};

export function TaskRequestCreateDrawer({ isOpen, requestTypes, requestTypeLabels, options, onOpenChange }: Props) {
    const [form, setForm] = useState<TaskRequestForm>(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});

    const dossierOptions = useMemo(() => {
        if (!form.client_id) return options.dossiers;

        return options.dossiers.filter((dossier) => dossier.clientId === form.client_id);
    }, [form.client_id, options.dossiers]);

    const close = () => {
        setErrors({});
        onOpenChange(false);
    };

    const updateDossier = (id: number | null) => {
        const dossier = options.dossiers.find((item) => item.id === id);
        setForm({
            ...form,
            dossier_id: id,
            client_id: dossier?.clientId ?? form.client_id,
        });
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrors({});

        router.post('/task-requests', form, {
            preserveScroll: true,
            onSuccess: () => {
                setForm(emptyForm);
                close();
                toast.success('Task request submitted.');
            },
            onError: (validationErrors) => {
                setErrors(validationErrors);
                toast.error('Please check the task request form.');
            },
        });
    };

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={(open) => (open ? onOpenChange(true) : close())}
            title="New task request"
            description="Create an operations request and link it to real CRM context."
            footer={
                <>
                    <AppButton variant="secondary" onPress={close}>Cancel</AppButton>
                    <AppButton variant="primary" type="submit" form="task-request-create-form">Submit request</AppButton>
                </>
            }
        >
            <form id="task-request-create-form" className="space-y-5" onSubmit={submit}>
                <AppFormErrorSummary errors={errors} />
                <AppSelect
                    label="Request type"
                    selectedKey={form.request_type}
                    onSelectionChange={(key) => setForm({ ...form, request_type: key ? String(key) : 'admin_help' })}
                    options={requestTypes.map((type) => ({ id: type, label: requestTypeLabels[type] ?? type }))}
                    error={firstError(errors, 'request_type')}
                    isRequired
                />
                <AppTextField
                    label="Title"
                    value={form.title}
                    onChange={(value) => setForm({ ...form, title: value })}
                    error={firstError(errors, 'title')}
                    placeholder="What needs to be done?"
                    isRequired
                />
                <AppTextarea
                    label="Description"
                    value={form.description}
                    onChange={(value) => setForm({ ...form, description: value })}
                    placeholder="Add useful details for the person who will handle it."
                />
                <AppSelect
                    label="Target user"
                    placeholder="Optional"
                    selectedKey={form.target_user_id ? String(form.target_user_id) : null}
                    onSelectionChange={(key) => setForm({ ...form, target_user_id: key ? Number(key) : null })}
                    options={options.users.map((user) => ({ id: String(user.id), label: user.label }))}
                />
                <div className="grid gap-4 md:grid-cols-2">
                    <AppSelect
                        label="Client"
                        placeholder="Optional"
                        selectedKey={form.client_id ? String(form.client_id) : null}
                        onSelectionChange={(key) => setForm({ ...form, client_id: key ? Number(key) : null, dossier_id: null })}
                        options={options.clients.map((client) => ({ id: String(client.id), label: client.label }))}
                    />
                    <AppSelect
                        label="Dossier"
                        placeholder="Optional"
                        selectedKey={form.dossier_id ? String(form.dossier_id) : null}
                        onSelectionChange={(key) => updateDossier(key ? Number(key) : null)}
                        options={dossierOptions.map((dossier) => ({ id: String(dossier.id), label: dossier.label }))}
                    />
                </div>
            </form>
        </AppDrawer>
    );
}
