import { router } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';
import { Input, TextArea } from '@heroui/react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DrawerField, DrawerSelect, drawerStyles } from '@/components/drawers';
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
                toast.success('Demande de tâche envoyée.');
            },
            onError: (validationErrors) => {
                setErrors(validationErrors);
                toast.error('Veuillez vérifier le formulaire de demande.');
            },
        });
    };

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={(open) => (open ? onOpenChange(true) : close())}
            title="Nouvelle demande de tâche"
            description="Créez une demande d'opération liée au CRM."
            footer={
                <>
                    <AppButton variant="secondary" onPress={close}>Annuler</AppButton>
                    <AppButton variant="primary" type="submit" form="task-request-create-form">Envoyer la demande</AppButton>
                </>
            }
        >
            <form id="task-request-create-form" className="space-y-4" onSubmit={submit}>
                <DrawerField label="Type de demande" error={firstError(errors, 'request_type')}>
                    <DrawerSelect
                        value={form.request_type}
                        onChange={(v) => setForm({ ...form, request_type: v })}
                        options={requestTypes.map((type) => ({ id: type, label: requestTypeLabels[type] ?? type }))}
                    />
                </DrawerField>
                <DrawerField label="Titre" error={firstError(errors, 'title')}>
                    <Input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Que faut-il faire ?" className={drawerStyles.input} />
                </DrawerField>
                <DrawerField label="Description">
                    <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Ajoutez des détails utiles pour la personne qui traitera la demande." className={drawerStyles.textarea} />
                </DrawerField>
                <DrawerField label="Utilisateur cible">
                    <DrawerSelect
                        value={form.target_user_id ? String(form.target_user_id) : ''}
                        onChange={(v) => setForm({ ...form, target_user_id: v ? Number(v) : null })}
                        options={options.users.map((user) => ({ id: String(user.id), label: user.label }))}
                        placeholder="Optionnel"
                    />
                </DrawerField>
                <div className="grid gap-3 md:grid-cols-2">
                    <DrawerField label="Client">
                        <DrawerSelect
                            value={form.client_id ? String(form.client_id) : ''}
                            onChange={(v) => setForm({ ...form, client_id: v ? Number(v) : null, dossier_id: null })}
                            options={options.clients.map((client) => ({ id: String(client.id), label: client.label }))}
                            placeholder="Optionnel"
                        />
                    </DrawerField>
                    <DrawerField label="Dossier">
                        <DrawerSelect
                            value={form.dossier_id ? String(form.dossier_id) : ''}
                            onChange={(v) => updateDossier(v ? Number(v) : null)}
                            options={dossierOptions.map((dossier) => ({ id: String(dossier.id), label: dossier.label }))}
                            placeholder="Optionnel"
                        />
                    </DrawerField>
                </div>
            </form>
        </AppDrawer>
    );
}
