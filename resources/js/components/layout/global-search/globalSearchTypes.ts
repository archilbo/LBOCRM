import { IconArchive, IconSignature, IconFileText, IconFolder, IconReceipt2, IconUserCircle } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';


export type BackendSearchResult = {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    href: string;
    badge: string | null;
    archive?: {
        number: string;
        status: string;
        location: string;
        city?: string | null;
        cityColor?: string | null;
        room?: string | null;
        href: string;
    } | null;
    /** Optional structured metadata pieces, one fact per entry. */
    meta?: string[];
};

export type SearchCategory = 'all' | 'client' | 'project' | 'document' | 'contract' | 'finance' | 'archive';

export const SEARCH_CATEGORIES: ReadonlyArray<{
    id: Exclude<SearchCategory, 'all'>;
    label: string;
    labelKey: string;
}> = [
    { id: 'client', label: 'Clients', labelKey: 'nav.clients' },
    { id: 'project', label: 'Projects', labelKey: 'nav.dossiers' },
    { id: 'document', label: 'Documents', labelKey: 'nav.documents' },
    { id: 'contract', label: 'Contracts', labelKey: 'nav.contracts' },
    { id: 'finance', label: 'Finance', labelKey: 'nav.finance' },
    { id: 'archive', label: 'Archives', labelKey: 'nav.archives' },
];

export const TYPE_ICONS: Record<string, Icon> = {
    Client: IconUserCircle,
    Project: IconFolder,
    Document: IconFileText,
    Contract: IconSignature,
    Finance: IconReceipt2,
    IconArchive: IconArchive,
};

/**
 * One distinct hue per search category. Used for icon tiles and section
 * headers so each category is recognizable at a glance.
 */
export const CATEGORY_COLORS: Record<Exclude<SearchCategory, 'all'>, string> = {
    client: '#3b82f6',
    project: 'var(--accent)',
    document: '#14b8a6',
    contract: '#f59e0b',
    finance: '#10b981',
    archive: 'var(--secondary)',
};

export const CATEGORY_SINGULAR_KEYS: Record<Exclude<SearchCategory, 'all'>, string> = {
    client: 'globalSearch.singular.client',
    project: 'globalSearch.singular.project',
    document: 'globalSearch.singular.document',
    contract: 'globalSearch.singular.contract',
    finance: 'globalSearch.singular.finance',
    archive: 'globalSearch.singular.archive',
};

export function categoryOf(type: string): SearchCategory {
    const id = type.toLowerCase();

    return SEARCH_CATEGORIES.some((category) => category.id === id) ? (id as SearchCategory) : 'client';
}

export type StatusTone = 'success' | 'warning' | 'danger' | 'default';

const SUCCESS_STATUSES = new Set([
    'active',
    'verified',
    'paid',
    'completed',
    'available',
    'ready',
    'received',
    'stored',
    'returned',
    'approved',
]);
const WARNING_STATUSES = new Set([
    'pending',
    'in_progress',
    'draft',
    'processing',
    'sent',
    'partially_paid',
    'reserved',
    'requested',
    'checked_out',
    'in_transit',
]);
const DANGER_STATUSES = new Set([
    'cancelled',
    'rejected',
    'overdue',
    'expired',
    'missing',
    'failed',
    'blocked',
]);

const KNOWN_STATUSES = new Set([...SUCCESS_STATUSES, ...WARNING_STATUSES, ...DANGER_STATUSES]);

/**
 * True only when the value is a real, recognizable status.
 * Workflow steps or entity names (e.g. a project's "client" step) are not
 * statuses and must not be rendered as status chips.
 */
export function isKnownStatus(status: string | null | undefined): boolean {
    const raw = (status ?? '').trim();

    return raw !== '' && KNOWN_STATUSES.has(raw.toLowerCase().replace(/[\s-]+/g, '_'));
}

export function normalizeStatus(status: string | null | undefined): { label: string; tone: StatusTone } {
    const raw = (status ?? '').trim();

    if (!raw) {
        return { label: '', tone: 'default' };
    }

    const key = raw.toLowerCase().replace(/[\s-]+/g, '_');
    const tone: StatusTone = SUCCESS_STATUSES.has(key)
        ? 'success'
        : WARNING_STATUSES.has(key)
          ? 'warning'
          : DANGER_STATUSES.has(key)
            ? 'danger'
            : 'default';
    const label = raw
        .replace(/[_-]+/g, ' ')
        .replace(/\b[a-z]/g, (character) => character.toUpperCase());

    return { label, tone };
}
