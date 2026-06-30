import { FormEvent } from 'react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import type { ChatUserOption } from '@/features/chat/types';

type Props = {
    isOpen: boolean;
    users: ChatUserOption[];
    formErrors: FormErrors;
    form: { user_id: string; subject: string };
    onOpenChange: (o: boolean) => void;
    onFormChange: (f: { user_id: string; subject: string }) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export function NewConversationDrawer({ isOpen, users, formErrors, form, onOpenChange, onFormChange, onSubmit }: Props) {
    return (
        <AppDrawer isOpen={isOpen} onOpenChange={(o) => { onOpenChange(o); if (!o) onOpenChange(false); }}
            title="New conversation" description="Start a direct conversation with another user."
            footer={<><AppButton variant="secondary" onPress={() => onOpenChange(false)}>Cancel</AppButton><AppButton variant="primary" type="submit" form="new-conv-form">Create</AppButton></>}>
            <form id="new-conv-form" className="space-y-5" onSubmit={onSubmit}>
                <AppFormErrorSummary errors={formErrors} />
                <AppSelect label="User" placeholder="Select user" selectedKey={form.user_id} onSelectionChange={(v) => onFormChange({ ...form, user_id: v ? String(v) : '' })}
                    options={users.map((u) => ({ id: String(u.id), label: u.name }))} error={firstError(formErrors, 'user_ids.0')} />
                <AppSelect label="Subject (optional)" placeholder="e.g. Re: Task 42" selectedKey={form.subject} onSelectionChange={(v) => onFormChange({ ...form, subject: v ? String(v) : '' })}
                    options={[{ id: '', label: 'None' }, { id: 'General inquiry', label: 'General inquiry' }, { id: 'Task follow-up', label: 'Task follow-up' }]} />
            </form>
        </AppDrawer>
    );
}
