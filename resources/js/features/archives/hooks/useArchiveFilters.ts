import { router } from '@inertiajs/react';
import { useCallback, useMemo, useRef } from 'react';

export type ArchiveFilters = {
    q?: string;
    status?: string[];
    city?: string;
    room?: string;
    box?: string;
    requesterId?: string;
    dossierId?: string;
    dueFrom?: string;
    dueTo?: string;
    overdueOnly?: boolean;
    sort?: string;
    page?: number;
    perPage?: number;
    viewMode?: 'list' | 'map';
};

export type UseArchiveFiltersOptions = {
    initial: ArchiveFilters;
    route: string;
};

function cleanFilters(f: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(f)) {
        if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) continue;
        if (k === 'page' && (v as number) <= 1) continue;
        if (k === 'perPage' && (v as number) === 15) continue;
        if (k === 'density' && v === 'default') continue;
        if (k === 'viewMode' && v === 'list') continue;
        out[k] = v;
    }
    return out;
}

export function useArchiveFilters({ initial, route }: UseArchiveFiltersOptions) {
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestRef = useRef<ArchiveFilters>(initial);

    const filters = initial;

    const nav = useCallback((next: Record<string, unknown>) => {
        const cleaned = cleanFilters({ ...next });
        router.get(route, cleaned as Record<string, string | number | boolean | null | undefined>, { preserveState: true, preserveScroll: true, replace: true });
    }, [route]);

    const patch = useCallback((partial: Partial<ArchiveFilters>) => {
        const next = { ...latestRef.current, ...partial, page: partial.page ?? 1 };
        latestRef.current = next as ArchiveFilters;
        nav(next);
    }, [nav]);

    const debouncedPatch = useCallback((partial: Partial<ArchiveFilters>) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => patch(partial), 250);
    }, [patch]);

    const reset = useCallback(() => {
        nav({});
    }, [nav]);

    const activeCount = useMemo(() => {
        let n = 0;
        if (filters.q) n++;
        if (filters.status?.length) n++;
        if (filters.city) n++;
        if (filters.room) n++;
        if (filters.box) n++;
        if (filters.requesterId) n++;
        if (filters.dossierId) n++;
        if (filters.dueFrom || filters.dueTo) n++;
        if (filters.overdueOnly) n++;
        return n;
    }, [filters]);

    const activeChips = useMemo(() => {
        const chips: { key: string; label: string; onRemove: () => void }[] = [];
        if (filters.q) chips.push({ key: 'q', label: `Search: "${filters.q}"`, onRemove: () => patch({ q: undefined }) });
        if (filters.status?.length) chips.push({ key: 'status', label: `Status: ${filters.status.join(', ')}`, onRemove: () => patch({ status: undefined }) });
        if (filters.city) chips.push({ key: 'city', label: `City: ${filters.city}`, onRemove: () => patch({ city: undefined }) });
        if (filters.room) chips.push({ key: 'room', label: `Room: ${filters.room}`, onRemove: () => patch({ room: undefined, box: undefined }) });
        if (filters.box) chips.push({ key: 'box', label: `Box: ${filters.box}`, onRemove: () => patch({ box: undefined }) });
        if (filters.requesterId) chips.push({ key: 'requesterId', label: `Requester: ${filters.requesterId}`, onRemove: () => patch({ requesterId: undefined }) });
        if (filters.dossierId) chips.push({ key: 'dossierId', label: `Dossier: ${filters.dossierId}`, onRemove: () => patch({ dossierId: undefined }) });
        if (filters.dueFrom || filters.dueTo) chips.push({ key: 'due', label: `Due: ${filters.dueFrom || '…'}→${filters.dueTo || '…'}`, onRemove: () => patch({ dueFrom: undefined, dueTo: undefined }) });
        return chips;
    }, [filters, patch]);

    return { filters, patch, debouncedPatch, reset, activeCount, activeChips };
}
