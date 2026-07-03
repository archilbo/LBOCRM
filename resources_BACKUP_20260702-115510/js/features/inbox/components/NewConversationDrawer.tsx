import { FormEvent, useState } from 'react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import type { ChatUserOption } from '@/features/chat/types';
import { CATEGORY_OPTIONS } from '@/features/inbox/utils';
import { Search, Check, Users, MessageCircle } from 'lucide-react';

export type NewConvFormData = {
    type: 'direct' | 'group';
    user_ids: number[];
    subject: string;
    category: string;
    custom_category: string;
};

type Props = {
    isOpen: boolean;
    users: ChatUserOption[];
    formErrors: FormErrors;
    form: NewConvFormData;
    onOpenChange: (o: boolean) => void;
    onFormChange: (f: NewConvFormData) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export function NewConversationDrawer({ isOpen, users, formErrors, form, onOpenChange, onFormChange, onSubmit }: Props) {
    const [userSearch, setUserSearch] = useState('');

    const filteredUsers = userSearch.trim()
        ? users.filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()))
        : users;

    const toggleUser = (id: number) => {
        const next = form.user_ids.includes(id)
            ? form.user_ids.filter((uid) => uid !== id)
            : [...form.user_ids, id];
        onFormChange({ ...form, user_ids: next });
    };

    const isDirect = form.type === 'direct';

    const showCustomCategory = form.category === 'custom' && !isDirect;

    return (
        <AppDrawer isOpen={isOpen} onOpenChange={(o) => { onOpenChange(o); if (!o) onOpenChange(false); }}
            title={isDirect ? "New conversation" : "New group"}
            description={isDirect ? "Start a direct conversation with another user." : "Create a group conversation with multiple users."}
            footer={<><AppButton variant="secondary" onPress={() => onOpenChange(false)}>Cancel</AppButton><AppButton variant="primary" type="submit" form="new-conv-form">Create</AppButton></>}>
            <form id="new-conv-form" className="space-y-5" onSubmit={onSubmit}>
                <AppFormErrorSummary errors={formErrors} />

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text)]">Type</label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => onFormChange({ ...form, type: 'direct' })}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                                isDirect ? 'border-[var(--crm-gold)] bg-[color-mix(in_srgb,var(--crm-gold)_15%,transparent)] text-[var(--crm-gold)]' : 'border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:border-[var(--crm-muted)]'
                            }`}>
                            <MessageCircle size={16} /> Direct
                        </button>
                        <button type="button" onClick={() => onFormChange({ ...form, type: 'group' })}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                                !isDirect ? 'border-[var(--crm-gold)] bg-[color-mix(in_srgb,var(--crm-gold)_15%,transparent)] text-[var(--crm-gold)]' : 'border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:border-[var(--crm-muted)]'
                            }`}>
                            <Users size={16} /> Group
                        </button>
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text)]">Subject (optional)</label>
                    <input value={form.subject} onChange={(e) => onFormChange({ ...form, subject: e.target.value })}
                        placeholder={isDirect ? "e.g. Re: Task 42" : "e.g. Project Alpha discussion"}
                        className="h-10 w-full rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-sm text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                </div>

                {!isDirect && (
                    <>
                        <AppSelect label="Category" placeholder="Select category" selectedKey={form.category} onSelectionChange={(v) => onFormChange({ ...form, category: v ? String(v) : 'general' })}
                            options={CATEGORY_OPTIONS.map((c) => ({ id: c.id, label: c.label }))} />
                        {showCustomCategory && (
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[var(--text)]">Custom category name</label>
                                <input value={form.custom_category} onChange={(e) => onFormChange({ ...form, custom_category: e.target.value })}
                                    placeholder="e.g. Suppliers"
                                    className="h-10 w-full rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-sm text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                                {formErrors.custom_category && <p className="mt-1 text-xs font-medium text-red-500">{firstError(formErrors, 'custom_category')}</p>}
                            </div>
                        )}
                    </>
                )}

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text)]">
                        {isDirect ? 'User' : 'Participants'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mb-2">
                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]" />
                        <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="Search users..."
                            className="h-9 w-full rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] pl-8 pr-3 text-sm text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                    </div>
                    <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-[var(--crm-border)] p-1.5">
                        {filteredUsers.length === 0 ? (
                            <p className="py-4 text-center text-xs text-[var(--crm-text-muted)]">No users found</p>
                        ) : filteredUsers.map((u) => {
                            const selected = form.user_ids.includes(u.id);
                            return (
                                <button key={u.id} type="button"
                                    onClick={() => {
                                        if (isDirect) {
                                            onFormChange({ ...form, user_ids: selected ? [] : [u.id] });
                                        } else {
                                            toggleUser(u.id);
                                        }
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                                        selected ? 'bg-[color-mix(in_srgb,var(--crm-gold)_10%,transparent)] text-[var(--crm-gold)]' : 'text-[var(--crm-text)] hover:bg-[var(--crm-surface)]'
                                    }`}>
                                    <div className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                                        selected ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)] text-black' : 'border-[var(--crm-border)]'
                                    }`}>
                                        {selected && <Check size={12} />}
                                    </div>
                                    <span className="truncate">{u.name}</span>
                                    <span className="ml-auto text-[10px] text-[var(--crm-text-muted)]">{u.email}</span>
                                </button>
                            );
                        })}
                    </div>
                    {!isDirect && form.user_ids.length > 0 && (
                        <p className="mt-1 text-[10px] text-[var(--crm-text-muted)]">{form.user_ids.length} participant(s) selected (you will be added automatically)</p>
                    )}
                </div>
            </form>
        </AppDrawer>
    );
}
