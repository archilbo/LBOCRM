import { FormEvent, useMemo, useRef, useState } from 'react';
import { Avatar } from '@heroui/react';
import { IconCheck, IconMessageCircle, IconSearch, IconUserPlus, IconUsers, IconX } from '@tabler/icons-react';

import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppInput } from '@/components/ui/AppInput';
import type { ChatUserOption } from '@/features/chat/types';
import { CATEGORY_OPTIONS, getAvatarTone, getCategoryLabel } from '@/features/inbox/utils';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';

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
    onOpenChange: (open: boolean) => void;
    onFormChange: (form: NewConvFormData) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

// ── Sub-components ────────────────────────────────────────────

function ConversationModeToggle({
    mode,
    onChange,
}: {
    mode: 'direct' | 'group';
    onChange: (m: 'direct' | 'group') => void;
}) {
    const { t } = useTranslation();
    return (
        <div className="flex rounded-xl bg-[var(--surface-2)] p-0.5" role="radiogroup" aria-label={t('inbox.convTypeAria')}>
            {(['direct', 'group'] as const).map((value) => {
                const active = mode === value;
                return (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(value)}
                        className={cn(
                            'flex flex-1 items-center justify-center gap-1.5 rounded-[11px] px-3 py-1.5 text-[10px] font-semibold outline-none transition-all',
                            'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
                            active
                                ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm'
                                : 'text-[var(--text-muted)] hover:text-[var(--text)]',
                        )}
                    >
                        {value === 'direct' ? <IconMessageCircle size={14} /> : <IconUsers size={14} />}
                        {value === 'direct' ? t('inbox.direct') : t('inbox.group')}
                    </button>
                );
            })}
        </div>
    );
}

function SelectedRecipients({
    users,
    onRemove,
}: {
    users: ChatUserOption[];
    onRemove: (id: number) => void;
}) {
    if (users.length === 0) return null;
    const { t } = useTranslation();
    return (
        <div className="flex flex-wrap gap-1.5">
            {users.map((user) => {
                const avatarTone = getAvatarTone(user.id);
                return (
                    <span
                        key={user.id}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] py-0.5 pl-0.5 pr-1 text-xs"
                    >
                        <Avatar size="sm" name={user.name} className={`size-5 min-w-5 text-[9px] ${avatarTone.bg} ${avatarTone.text}`} />
                        <span className="max-w-24 truncate">{user.name}</span>
                        <button
                            type="button"
                            onClick={() => onRemove(user.id)}
                            className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                            aria-label={t('inbox.removeUser', { name: user.name })}
                        >
                            <IconX size={10} />
                        </button>
                    </span>
                );
            })}
        </div>
    );
}

function ConversationUserRow({
    user,
    selected,
    onToggle,
}: {
    user: ChatUserOption;
    selected: boolean;
    onToggle: () => void;
}) {
    const rowRef = useRef<HTMLDivElement>(null);
    const t = getAvatarTone(user.id);
    return (
        <div
            ref={rowRef}
            role="checkbox"
            aria-checked={selected}
            tabIndex={0}
            onClick={onToggle}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggle();
                }
            }}
            className={cn(
                'flex h-[62px] cursor-pointer items-center gap-3 border-b border-[color-mix(in_srgb,var(--border)_55%,transparent)] px-3 outline-none transition last:border-0',
                selected
                    ? 'bg-[color-mix(in_srgb,var(--accent)_9%,transparent)]'
                    : 'hover:bg-[var(--surface-2)]',
                'focus-visible:bg-[var(--surface-2)]',
            )}
        >
            <div
                className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-md border transition',
                    selected
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                        : 'border-[var(--border)] bg-[var(--surface-2)]',
                )}
            >
                {selected ? <IconCheck size={12} /> : null}
            </div>
            <Avatar size="sm" name={user.name} className={`shrink-0 ${t.bg} ${t.text}`} />
            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[var(--text)]">{user.name}</div>
                <div className="truncate text-xs text-[var(--text-muted)]">{user.email}</div>
            </div>
        </div>
    );
}

function ConversationGroupFields({
    category,
    customCategory,
    onCategoryChange,
    onCustomCategoryChange,
    errors,
}: {
    category: string;
    customCategory: string;
    onCategoryChange: (cat: string) => void;
    onCustomCategoryChange: (val: string) => void;
    errors: FormErrors;
}) {
    const { t } = useTranslation();
    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">{t('inbox.category')}</label>
                <div className="flex flex-wrap gap-1.5">
                    {CATEGORY_OPTIONS.map((opt) => {
                        const active = category === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => onCategoryChange(opt.id)}
                                className={cn(
                                    'rounded-lg border px-2.5 py-1 text-xs font-medium transition',
                                    active
                                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                                        : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
                                )}
                            >
                                {getCategoryLabel(opt.id, t)}
                            </button>
                        );
                    })}
                </div>
            </div>
            {category === 'custom' ? (
                <AppInput
                    label={t('inbox.newCategory')}
                    value={customCategory}
                    onChange={onCustomCategoryChange}
                    placeholder={t('inbox.categoryPlaceholder')}
                    error={firstError(errors, 'custom_category')}
                />
            ) : null}
        </div>
    );
}

function ConversationDrawerFooter({
    userCount,
    isDirect,
    onCancel,
}: {
    userCount: number;
    isDirect: boolean;
    onCancel: () => void;
}) {
    const { t } = useTranslation();
    return (
        <>
            <span className="mr-auto text-[9px] text-[var(--text-muted)]">
                {userCount > 0
                    ? t('inbox.selectedCount', { count: userCount, s: userCount > 1 ? 's' : '' })
                    : t('inbox.noRecipients')}
            </span>
            <AppButton variant="secondary" onPress={onCancel}>
                {t('inbox.cancel')}
            </AppButton>
            <AppButton type="submit" form="new-conversation-form" variant="primary" isDisabled={userCount === 0}>
                {isDirect ? t('inbox.start') : t('inbox.createGroup')}
            </AppButton>
        </>
    );
}

// ── Main drawer ───────────────────────────────────────────────

export function NewConversationDrawer({
    isOpen,
    users,
    formErrors,
    form,
    onOpenChange,
    onFormChange,
    onSubmit,
}: Props) {
    const { t } = useTranslation();
    const [userSearch, setUserSearch] = useState('');
    const isDirect = form.type === 'direct';
    const filteredUsers = useMemo(() => {
        const query = userSearch.trim().toLocaleLowerCase();
        return query
            ? users.filter((u) => `${u.name} ${u.email}`.toLocaleLowerCase().includes(query))
            : users;
    }, [userSearch, users]);
    const selectedUsers = useMemo(
        () => users.filter((u) => form.user_ids.includes(u.id)),
        [form.user_ids, users],
    );

    function selectUser(id: number, selected: boolean) {
        const userIds = isDirect
            ? (selected ? [] : [id])
            : selected
              ? form.user_ids.filter((uid) => uid !== id)
              : [...form.user_ids, id];
        onFormChange({ ...form, user_ids: userIds });
    }

    function handleOpenChange(open: boolean) {
        onOpenChange(open);
        if (!open) {
            setUserSearch('');
        }
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
            title={t('inbox.newConversation')}
            headerIcon={<IconUserPlus size={18} />}
            panelClassName="max-w-[430px]"
            contentClassName="[scrollbar-width:none]"
            footer={
                <ConversationDrawerFooter
                    userCount={form.user_ids.length}
                    isDirect={isDirect}
                    onCancel={() => handleOpenChange(false)}
                />
            }
        >
            <form
                id="new-conversation-form"
                className="flex h-full flex-col gap-4"
                onSubmit={onSubmit}
            >
                <AppFormErrorSummary errors={formErrors} />

                <ConversationModeToggle
                    mode={form.type}
                    onChange={(m) => onFormChange({ ...form, type: m, user_ids: [] })}
                />

                <AppInput
                    label={t('inbox.subject')}
                    value={form.subject}
                    onChange={(val) => onFormChange({ ...form, subject: val })}
                    placeholder={isDirect ? t('inbox.subjectDirectPlaceholder') : t('inbox.subjectGroupPlaceholder')}
                    description={
                        isDirect ? t('inbox.optional') : t('inbox.groupNameDesc')
                    }
                />

                {!isDirect ? (
                    <ConversationGroupFields
                        category={form.category}
                        customCategory={form.custom_category}
                        onCategoryChange={(cat) => onFormChange({ ...form, category: cat })}
                        onCustomCategoryChange={(val) =>
                            onFormChange({ ...form, custom_category: val })
                        }
                        errors={formErrors}
                    />
                ) : null}

                <section className="space-y-2.5" aria-labelledby="participants-heading">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 id="participants-heading" className="text-sm font-semibold">
                                {isDirect ? t('inbox.recipient') : t('inbox.participants')}
                            </h3>
                            <p className="text-xs text-[var(--text-muted)]">
                                {isDirect
                                    ? t('inbox.selectPerson')
                                    : t('inbox.autoAdded')}
                            </p>
                        </div>
                        {!isDirect && form.user_ids.length > 0 ? (
                            <AppBadge variant="subtle" tone="amber">
                                {form.user_ids.length} choisis
                            </AppBadge>
                        ) : null}
                    </div>

                    <div className="relative">
                        <IconSearch
                            size={14}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                        />
                        <input
                            type="text"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="h-9 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] pl-9 pr-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                            aria-label="Rechercher un utilisateur"
                        />
                    </div>

                    <SelectedRecipients
                        users={selectedUsers}
                        onRemove={(id) => selectUser(id, true)}
                    />

                    <div className="max-h-[280px] overflow-y-auto rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-2)_65%,transparent)] p-1 [scrollbar-width:none] [-ms-overflow-style:none]">
                        {filteredUsers.length === 0 ? (
                            <AppEmptyState
                                title="Aucun utilisateur trouvé"
                                description="Essayez un autre terme de recherche."
                                className="border-none bg-transparent py-8"
                            />
                        ) : (
                            filteredUsers.map((user) => (
                                <ConversationUserRow
                                    key={user.id}
                                    user={user}
                                    selected={form.user_ids.includes(user.id)}
                                    onToggle={() =>
                                        selectUser(user.id, form.user_ids.includes(user.id))
                                    }
                                />
                            ))
                        )}
                    </div>
                </section>
            </form>
        </AppDrawer>
    );
}
