import { IconAlertTriangle, IconCalendarEvent, IconChevronRight, IconClockHour3, IconListCheck } from '@tabler/icons-react';
import { Card, Chip } from '@heroui/react';
import { motion, useReducedMotion } from 'framer-motion';

import { AppButton } from '@/components/ui/AppButton';
import type { DashboardAttentionItem, DashboardTone } from '@/features/dashboard/types';
import { useTranslation } from '@/lib/i18n';

type Props = {
    items: DashboardAttentionItem[];
    onOpen: (href: string) => void;
};

const toneClasses: Record<DashboardTone, { accent: string; chip: 'accent' | 'warning' | 'danger' }> = {
    gold: { accent: 'text-[var(--accent)]', chip: 'warning' },
    green: { accent: 'text-[var(--success)]', chip: 'accent' },
    red: { accent: 'text-[var(--danger)]', chip: 'danger' },
    blue: { accent: 'text-[var(--info)]', chip: 'accent' },
    violet: { accent: 'text-[var(--secondary)]', chip: 'accent' },
    neutral: { accent: 'text-[var(--text-muted)]', chip: 'accent' },
};

function urgencyLabel(urgency: DashboardAttentionItem['urgency'], t: (key: string) => string) {
    return urgency === 'overdue'
        ? t('calendar.overdue')
        : urgency === 'today'
            ? t('calendar.dueToday')
            : t('calendar.upcoming');
}

export function DashboardAttentionPanel({ items, onOpen }: Props) {
    const { t, locale } = useTranslation();
    const reduceMotion = useReducedMotion();
    const intlLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

    return (
        <Card className="relative isolate gap-0 overflow-hidden border border-[color-mix(in_srgb,var(--danger)_38%,var(--border))] bg-[linear-gradient(120deg,color-mix(in_srgb,var(--danger)_22%,var(--surface)),color-mix(in_srgb,var(--danger)_9%,var(--surface))_55%,var(--surface-2))] shadow-sm">
            <span aria-hidden className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-[color-mix(in_srgb,var(--danger)_20%,transparent)] blur-3xl" />
            <span aria-hidden className="pointer-events-none absolute -bottom-24 left-1/4 size-48 rounded-full bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] blur-3xl" />

            <Card.Header className="relative !flex-row !flex-nowrap min-w-0 items-center gap-3 border-b border-[color-mix(in_srgb,var(--danger)_24%,var(--border))] px-4 py-3 text-left">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--danger)_34%,transparent)] bg-[color-mix(in_srgb,var(--danger)_16%,transparent)] text-[var(--danger)]">
                    <IconAlertTriangle size={17} />
                </span>
                <div className="min-w-0 flex-1">
                    <Card.Title className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                        <motion.span
                            aria-hidden
                            className="size-1.5 shrink-0 rounded-full bg-[var(--danger)]"
                            animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45], scale: [0.8, 1.25, 0.8] }}
                            transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        {t('dashboard.attention.title')}
                    </Card.Title>
                    <Card.Description className="mt-0.5 truncate text-[10px]">{t('dashboard.attention.detail')}</Card.Description>
                </div>
                <Chip size="sm" variant="soft" color={items.length > 0 ? 'danger' : 'success'}>{items.length}</Chip>
            </Card.Header>

            <Card.Content className="relative p-2">
                {items.length > 0 ? (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.055 } },
                        }}
                        className="grid gap-1.5 sm:grid-cols-2">
                        {items.map((item) => {
                            const styles = toneClasses[item.tone];
                            const Icon = item.kind === 'task' ? IconListCheck : IconCalendarEvent;
                            const when = new Date(item.at).toLocaleString(intlLocale, {
                                weekday: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <motion.div
                                    key={item.id}
                                    variants={{
                                        hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.98 },
                                        visible: { opacity: 1, y: 0, scale: 1 },
                                    }}
                                    transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 28 }}>
                                    <AppButton
                                        variant="ghost"
                                        onPress={() => onOpen(item.href)}
                                        className="group h-auto min-h-[68px] w-full justify-start rounded-xl border border-[color-mix(in_srgb,var(--danger)_20%,var(--border))] bg-[color-mix(in_srgb,var(--surface)_84%,transparent)] p-0 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--danger)_44%,var(--border))] hover:bg-[color-mix(in_srgb,var(--surface)_94%,transparent)]">
                                        <span className="flex w-full min-w-0 items-center gap-2 p-2">
                                            <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg border border-current/10 bg-[color-mix(in_srgb,var(--danger)_9%,transparent)] ${styles.accent}`}><Icon size={15} /></span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex min-w-0 items-center gap-1.5">
                                                    <span className={`truncate text-[9px] font-semibold uppercase tracking-[0.1em] ${styles.accent}`}>{t(`dashboard.attention.${item.kind}`)}</span>
                                                    <Chip size="sm" variant="soft" color={styles.chip} className="ml-auto shrink-0 text-[8px]">{urgencyLabel(item.urgency, t)}</Chip>
                                                </span>
                                                <span className="mt-0.5 flex min-w-0 items-center gap-1.5">
                                                    <motion.span
                                                        aria-hidden
                                                        className="size-1.5 shrink-0 rounded-full bg-[var(--danger)]"
                                                        animate={reduceMotion ? undefined : { opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                                                        transition={reduceMotion ? undefined : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                                    />
                                                    <span className="truncate text-xs font-semibold text-[var(--foreground)]">{item.title}</span>
                                                </span>
                                                <span className="mt-0.5 flex min-w-0 items-center gap-1 text-[9px] text-[var(--text-muted)]">
                                                    <IconClockHour3 size={11} className="shrink-0" />
                                                    <span className="truncate capitalize">{when}</span>
                                                    <span className="truncate">/ {item.context}</span>
                                                </span>
                                            </span>
                                            <IconChevronRight size={15} className="shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
                                        </span>
                                    </AppButton>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <div className="flex min-h-[72px] items-center justify-center rounded-xl border border-dashed border-[color-mix(in_srgb,var(--danger)_32%,var(--border))] bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] px-4 text-center text-xs text-[var(--text-muted)]">
                        {t('dashboard.attention.empty')}
                    </div>
                )}
            </Card.Content>
        </Card>
    );
}
