import { IconAlertTriangle, IconChevronDown, IconFilter, IconPlus, IconSearch, IconUser } from '@tabler/icons-react';
import { Card, Chip, Input, ListBox, Select } from '@heroui/react';

import type { CalendarEventRow, CalendarEventType } from '@/features/calendar/types';
import { AppButton } from '@/components/ui/AppButton';
import { EVENT_TYPE_COLORS } from '@/features/calendar/types';
import { MiniCalendar } from '@/features/calendar/components/MiniCalendar';
import { useTranslation } from '@/lib/i18n';

type UserOption = { id: number; name: string; email: string };

type Props = {
    search: string;
    onSearchChange: (value: string) => void;
    filterType: string;
    onFilterTypeChange: (value: string) => void;
    filterUserId: string;
    onFilterUserIdChange: (value: string) => void;
    currentDate: Date;
    onSelectDate: (date: Date) => void;
    users: UserOption[];
    onCreateClick: () => void;
    canCreate: boolean;
    events: CalendarEventRow[];
};

const EVENT_TYPES = Object.keys(EVENT_TYPE_COLORS) as CalendarEventType[];

export function CalendarSidebar({
    search,
    onSearchChange,
    filterType,
    onFilterTypeChange,
    filterUserId,
    onFilterUserIdChange,
    currentDate,
    onSelectDate,
    users,
    onCreateClick,
    canCreate,
    events,
}: Props) {
    const { t, locale } = useTranslation();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const overdueCount = events.filter(
        (event) => event.startsAt < todayStr && event.status !== 'completed' && event.status !== 'cancelled',
    ).length;
    const currentDateLabel = currentDate.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <Card className="border-0 bg-transparent shadow-none">
            <Card.Header className="flex items-center justify-between gap-3 px-1 pb-3 pt-1">
                <div className="min-w-0">
                    <Card.Title className="text-sm font-semibold text-[var(--foreground)]">{t('calendar.title')}</Card.Title>
                    <Card.Description className="mt-0.5 text-[10px] capitalize">{currentDateLabel}</Card.Description>
                </div>
                <AppButton
                    type="button"
                    variant="accent"
                    isIconOnly
                    compact
                    onPress={onCreateClick}
                    isDisabled={!canCreate}
                    aria-label={t('calendar.newEvent')}
                    tooltip={t('calendar.newEvent')}>
                    <IconPlus size={15} />
                </AppButton>
            </Card.Header>

            <Card.Content className="space-y-5 overflow-visible px-1 pb-1">
                <div className="relative">
                    <IconSearch size={14} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--text-muted)]" />
                    <Input
                        type="search"
                        aria-label={t('calendar.search')}
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder={t('calendar.search')}
                        className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/60 pl-9 pr-3 text-xs text-[var(--foreground)] placeholder:text-[var(--text-muted)]" />
                </div>

                <section className="border-y border-[var(--border)] py-4">
                    <MiniCalendar currentDate={currentDate} onSelectDate={onSelectDate} />
                </section>

                <section className="space-y-2.5">
                    <div className="flex items-center justify-between px-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{t('calendar.eventType')}</span>
                        {filterType ? <Chip size="sm" variant="soft" className="bg-[var(--surface-2)] text-[9px] text-[var(--accent)]">1</Chip> : null}
                    </div>
                    <Select
                        selectedKey={filterType || 'all'}
                        onSelectionChange={(key) => onFilterTypeChange(key === 'all' ? '' : String(key))}>
                        <Select.Trigger className="flex h-9 w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-left text-xs text-[var(--foreground)] transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))]">
                            <IconFilter size={13} className="shrink-0 text-[var(--text-muted)]" />
                            <Select.Value className="min-w-0 flex-1 truncate" />
                            <Select.Indicator><IconChevronDown size={14} className="text-[var(--text-muted)]" /></Select.Indicator>
                        </Select.Trigger>
                        <Select.Popover className="min-w-[220px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                            <ListBox className="max-h-64 overflow-y-auto" aria-label={t('calendar.eventType')}>
                                <ListBox.Item id="all" textValue={t('calendar.allTypes')} className="rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] outline-none data-[focused]:bg-[var(--surface-2)]">
                                    {t('calendar.allTypes')}
                                </ListBox.Item>
                                {EVENT_TYPES.map((type) => (
                                    <ListBox.Item key={type} id={type} textValue={t(`calendar.eventTypes.${type}`)} className="rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] outline-none data-[focused]:bg-[var(--surface-2)]">
                                        <span className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ backgroundColor: EVENT_TYPE_COLORS[type] }} />{t(`calendar.eventTypes.${type}`)}</span>
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </section>

                <section className="space-y-2.5">
                    <div className="flex items-center justify-between px-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{t('calendar.user')}</span>
                        <Chip size="sm" variant="soft" className="bg-[var(--surface-2)] text-[9px] text-[var(--text-muted)]">{filterUserId ? 1 : users.length}</Chip>
                    </div>
                    <Select
                        selectedKey={filterUserId || 'all'}
                        onSelectionChange={(key) => onFilterUserIdChange(key === 'all' ? '' : String(key))}>
                        <Select.Trigger className="flex h-9 w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-left text-xs text-[var(--foreground)] transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))]">
                            <IconUser size={13} className="shrink-0 text-[var(--text-muted)]" />
                            <Select.Value className="min-w-0 flex-1 truncate" />
                            <Select.Indicator><IconChevronDown size={14} className="text-[var(--text-muted)]" /></Select.Indicator>
                        </Select.Trigger>
                        <Select.Popover className="min-w-[220px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                            <ListBox className="max-h-64 overflow-y-auto" aria-label={t('calendar.user')}>
                                <ListBox.Item id="all" textValue={t('calendar.allUsers')} className="rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] outline-none data-[focused]:bg-[var(--surface-2)]">
                                    {t('calendar.allUsers')}
                                </ListBox.Item>
                                {users.map((user) => (
                                    <ListBox.Item key={user.id} id={String(user.id)} textValue={user.name} className="rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] outline-none data-[focused]:bg-[var(--surface-2)]">
                                        <span className="flex min-w-0 items-center gap-2"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[9px] font-bold">{user.name.slice(0, 1).toUpperCase()}</span><span className="truncate">{user.name}</span></span>
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </section>

                {overdueCount > 0 ? (
                    <Chip variant="soft" color="danger" className="h-auto w-full justify-start gap-2 rounded-lg border border-red-500/15 bg-red-500/8 px-3 py-2 text-xs font-semibold text-red-400">
                        <IconAlertTriangle size={13} /> {t('calendar.todayOverdue', { count: overdueCount })}
                    </Chip>
                ) : null}
            </Card.Content>
        </Card>
    );
}
