import { router } from '@inertiajs/react';
import {
    BadgeDollarSign,
    Building2,
    ChevronRight,
    Eye,
    FileCheck2,
    FolderKanban,
    MapPinned,
    MoreHorizontal,
    Pencil,
    Search,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/cn';
import type {
    DossierCommuneGroup,
    DossierLocationGroup,
    DossierLocationRow,
} from '@/features/dossiers/types';

type Props = {
    groups: DossierLocationGroup[];
};

function money(value: number) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function workflowLabel(value: string) {
    const labels: Record<string, string> = {
        client: 'Client',
        documents: 'Documents',
        contract: 'Contract',
        authorization: 'Authorization',
        finance: 'Finance',
        archive: 'Archive',
    };
    return labels[value] ?? value;
}

function searchProject(project: DossierLocationRow, query: string) {
    if (!query.trim()) return true;
    return [
        project.dossierNumber,
        project.projectObject,
        project.projectAddress,
        project.ownerName,
        project.clientNumber,
        project.status,
        project.workflowStep,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase());
}

const PROVINCE_COLORS = [
    'bg-blue-500/15 text-blue-500',
    'bg-emerald-500/15 text-emerald-500',
    'bg-violet-500/15 text-violet-500',
    'bg-amber-500/15 text-amber-500',
    'bg-rose-500/15 text-rose-500',
    'bg-cyan-500/15 text-cyan-500',
];

function provinceColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PROVINCE_COLORS[Math.abs(hash) % PROVINCE_COLORS.length];
}

function statusColor(status: string) {
    if (status === 'active') return 'success';
    if (status === 'opened') return 'primary';
    if (status === 'closed') return 'default';
    if (status === 'archived' || status === 'paused') return 'warning';
    return 'default';
}

export function DossierLocationExplorer({ groups }: Props) {
    const [selectedProvince, setSelectedProvince] = useState(groups[0]?.province ?? '');
    const [selectedCommune, setSelectedCommune] = useState(groups[0]?.communes[0]?.commune ?? '');
    const [query, setQuery] = useState('');
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [mobileStep, setMobileStep] = useState<'provinces' | 'communes' | 'projects'>('provinces');
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (openMenuId === null) return;
        function handleClick(e: MouseEvent) {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-row-menu]')) setOpenMenuId(null);
        }
        function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpenMenuId(null); }
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
    }, [openMenuId]);

    const selectedProvinceGroup = useMemo(
        () => groups.find((g) => g.province === selectedProvince) ?? null,
        [groups, selectedProvince],
    );

    const activeCommune = useMemo<DossierCommuneGroup | null>(() => {
        if (!selectedProvinceGroup) return null;
        return selectedProvinceGroup.communes.find((c) => c.commune === selectedCommune) ?? null;
    }, [selectedProvinceGroup, selectedCommune]);

    const projects = useMemo(
        () => (activeCommune?.dossiers ?? []).filter((p) => searchProject(p, query)),
        [activeCommune, query],
    );

    const summaryCards = useMemo(() => {
        const totalProvinces = groups.length;
        const totalCommunes = groups.reduce((s, g) => s + g.communes.length, 0);
        const totalProjects = groups.reduce((s, g) => s + g.stats.projectsCount, 0);
        const totalDocuments = groups.reduce((s, g) => s + g.stats.documentsCount, 0);
        const activeCommunes = groups.reduce((s, g) =>
            s + g.communes.filter((c) => c.stats.projectsCount > 0).length, 0);
        return [
            { label: 'Provinces', value: totalProvinces, detail: 'Administrative regions', icon: <MapPinned size={15} /> },
            { label: 'Communes', value: totalCommunes, detail: 'Local divisions' },
            { label: 'Projects', value: totalProjects, detail: 'Tracked dossiers' },
            { label: 'Documents', value: totalDocuments, detail: 'Linked files' },
            { label: 'Active locations', value: activeCommunes, detail: 'Communes with projects' },
        ];
    }, [groups]);

    function chooseProvince(group: DossierLocationGroup) {
        setSelectedProvince(group.province);
        setSelectedCommune(group.communes[0]?.commune ?? '');
        setQuery('');
        setMobileStep('communes');
    }

    function chooseCommune(commune: DossierCommuneGroup) {
        setSelectedCommune(commune.commune);
        setQuery('');
        setMobileStep('projects');
    }

    if (!groups.length) {
        return (
            <AppEmptyState
                title="No location groups found"
                description="Create projects with province and commune to see the location browser."
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* ── Summary strip ── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {summaryCards.map((card) => (
                    <div key={card.label}
                        className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
                        {card.icon ? (
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]">
                                {card.icon}
                            </div>
                        ) : null}
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium text-[var(--text-muted)]">{card.label}</p>
                            <p className="text-lg font-semibold text-[var(--foreground)]">{card.value}</p>
                            <p className="text-[10px] text-[var(--text-subtle)]">{card.detail}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Mobile: Province select step ── */}
            {mobileStep === 'provinces' && (
                <div className="block xl:hidden">
                    <div className="mb-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Provinces</p>
                        <p className="text-xs text-[var(--text-muted)]">Select a province to view communes</p>
                    </div>
                    <div className="grid gap-2">
                        {groups.map((group) => (
                            <button key={group.province} type="button" onClick={() => chooseProvince(group)}
                                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left transition hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]">
                                <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold', provinceColor(group.province))}>
                                    {group.province.charAt(0)}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-[var(--foreground)]">{group.province}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{group.communes.length} communes · {group.stats.projectsCount} projects</p>
                                </div>
                                <ChevronRight size={16} className="shrink-0 text-[var(--text-muted)]" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Mobile: Commune select step ── */}
            {mobileStep === 'communes' && selectedProvinceGroup && (
                <div className="block xl:hidden">
                    <button type="button" onClick={() => setMobileStep('provinces')}
                        className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--accent)] hover:underline">
                        <ChevronRight size={14} className="rotate-180" />
                        Back to provinces
                    </button>
                    <div className="mb-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{selectedProvinceGroup.province}</p>
                        <p className="text-xs text-[var(--text-muted)]">Select a commune to view projects</p>
                    </div>
                    <div className="grid gap-2">
                        {selectedProvinceGroup.communes.map((commune) => (
                            <button key={commune.commune} type="button" onClick={() => chooseCommune(commune)}
                                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left transition hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-[var(--foreground)]">{commune.commune}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{commune.stats.projectsCount} projects · {commune.stats.documentsCount} docs</p>
                                </div>
                                <ChevronRight size={16} className="shrink-0 text-[var(--text-muted)]" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Mobile: Projects step ── */}
            {mobileStep === 'projects' && activeCommune && (
                <div className="block xl:hidden">
                    <button type="button" onClick={() => setMobileStep('communes')}
                        className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--accent)] hover:underline">
                        <ChevronRight size={14} className="rotate-180" />
                        Back to communes
                    </button>
                    <div className="mb-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                            {selectedProvinceGroup?.province} / {activeCommune.commune}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">{projects.length} visible project(s)</p>
                    </div>
                    <ProjectSearchBar query={query} setQuery={setQuery} searchRef={searchRef} />
                    <div className="mt-3 grid gap-3">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <ProjectCard key={project.id} project={project} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} />
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-10 text-center">
                                <p className="text-sm font-medium text-[var(--foreground)]">No projects found</p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">Choose another commune or clear search.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Desktop 3-column layout ── */}
            <div className="hidden xl:grid xl:grid-cols-[280px_300px_minmax(0,1fr)] xl:gap-0 xl:rounded-xl xl:border xl:border-[var(--border)] xl:bg-[var(--surface)] xl:shadow-sm xl:overflow-hidden">
                {/* Left: Provinces */}
                <aside className="border-r border-[var(--border)]">
                    <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                        <div className="flex items-center gap-2">
                            <MapPinned size={15} className="text-[var(--accent)]" />
                            <div>
                                <p className="text-[12px] font-semibold text-[var(--foreground)]">Provinces</p>
                                <p className="text-[10px] text-[var(--text-muted)]">{groups.length} total</p>
                            </div>
                        </div>
                    </div>
                    <div className="app-scrollbar max-h-[580px] overflow-y-auto">
                        {groups.map((group) => {
                            const isActive = selectedProvinceGroup?.province === group.province;
                            return (
                                <button key={group.province} type="button" onClick={() => chooseProvince(group)}
                                    className={cn(
                                        'flex w-full items-center gap-3 px-4 py-3 text-left transition',
                                        isActive
                                            ? 'bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]'
                                            : 'hover:bg-[var(--surface-2)]',
                                    )}>
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--accent)]" />}
                                    <span className={cn(
                                        'flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold',
                                        isActive ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : provinceColor(group.province),
                                    )}>
                                        {group.province.charAt(0)}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className={cn(
                                            'truncate text-[13px] font-medium',
                                            isActive ? 'text-[var(--accent)]' : 'text-[var(--foreground)]',
                                        )}>{group.province}</p>
                                        <p className="truncate text-[11px] text-[var(--text-muted)]">
                                            {group.stats.projectsCount} projects · {group.communes.length} communes
                                        </p>
                                    </div>
                                    <span className={cn(
                                        'inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                                        isActive
                                            ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                                            : 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                                    )}>{group.stats.projectsCount}</span>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Middle: Communes */}
                <aside className="border-r border-[var(--border)]">
                    <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Building2 size={15} className="text-[var(--accent)]" />
                            <div>
                                <p className="text-[12px] font-semibold text-[var(--foreground)]">Communes</p>
                                <p className="text-[10px] text-[var(--text-muted)]">{selectedProvinceGroup?.province || 'Select a province'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="app-scrollbar max-h-[580px] overflow-y-auto">
                        {selectedProvinceGroup ? (
                            selectedProvinceGroup.communes.map((commune) => {
                                const isActive = activeCommune?.commune === commune.commune;
                                return (
                                    <button key={commune.commune} type="button" onClick={() => chooseCommune(commune)}
                                        className={cn(
                                            'flex w-full items-center gap-3 px-4 py-3 text-left transition',
                                            isActive
                                                ? 'bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]'
                                                : 'hover:bg-[var(--surface-2)]',
                                        )}>
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--accent)]" />}
                                        <span className={cn(
                                            'flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold',
                                            isActive
                                                ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                                                : 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                                        )}>
                                            {commune.commune.charAt(0)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className={cn(
                                                'truncate text-[13px] font-medium',
                                                isActive ? 'text-[var(--accent)]' : 'text-[var(--foreground)]',
                                            )}>{commune.commune}</p>
                                            <p className="truncate text-[11px] text-[var(--text-muted)]">
                                                {commune.stats.projectsCount} projects · {commune.stats.documentsCount} docs
                                            </p>
                                        </div>
                                        <span className={cn(
                                            'inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                                            isActive
                                                ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                                                : 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                                        )}>{commune.stats.projectsCount}</span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
                                <Building2 size={28} className="text-[var(--text-muted)]/40" />
                                <p className="text-[13px] font-medium text-[var(--foreground)]">Select a province</p>
                                <p className="text-[11px] text-[var(--text-muted)]">to view communes</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Right: Projects */}
                <main className="min-w-0 flex flex-col">
                    <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[12px] font-semibold text-[var(--foreground)]">
                                    {selectedProvinceGroup?.province && activeCommune?.commune
                                        ? `${selectedProvinceGroup.province} / ${activeCommune.commune}`
                                        : 'Select location'}
                                </p>
                                <p className="text-[10px] text-[var(--text-muted)]">{projects.length} visible project(s)</p>
                            </div>
                            {activeCommune ? (
                                <ProjectSearchBar query={query} setQuery={setQuery} searchRef={searchRef} compact />
                            ) : null}
                        </div>
                    </div>
                    <div className="app-scrollbar flex-1 space-y-3 overflow-y-auto p-4 max-h-[580px]">
                        {activeCommune ? (
                            projects.length > 0 ? (
                                projects.map((project) => (
                                    <ProjectCard key={project.id} project={project} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} />
                                ))
                            ) : (
                                <div className="flex flex-col items-center gap-2 py-16 text-center">
                                    <FolderKanban size={32} className="text-[var(--text-muted)]/30" />
                                    <p className="text-[13px] font-medium text-[var(--foreground)]">No projects found</p>
                                    <p className="text-[11px] text-[var(--text-muted)]">Choose another commune or clear search.</p>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-16 text-center">
                                <Building2 size={32} className="text-[var(--text-muted)]/30" />
                                <p className="text-[13px] font-medium text-[var(--foreground)]">Select a commune</p>
                                <p className="text-[11px] text-[var(--text-muted)]">to view projects</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

function ProjectSearchBar({ query, setQuery, searchRef, compact }: {
    query: string; setQuery: (v: string) => void; searchRef: React.RefObject<HTMLInputElement | null>; compact?: boolean;
}) {
    return (
        <div className={cn('relative', compact ? 'w-[200px]' : 'w-full')}>
            <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects..."
                className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-8 pr-7 text-[12px] text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
            />
            {query ? (
                <button type="button" onClick={() => setQuery('')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--foreground)]">
                    <X size={11} />
                </button>
            ) : null}
        </div>
    );
}

function RowMenu({ project, isOpen, onToggle }: {
    project: DossierLocationRow; isOpen: boolean; onToggle: () => void;
}) {
    const items = [
        { id: 'open', label: 'Open', icon: <Eye size={14} />, action: () => router.visit(`/dossiers/${project.id}`), danger: false },
        { id: 'edit', label: 'Edit', icon: <Pencil size={14} />, action: () => router.visit(`/dossiers/${project.id}`), danger: false },
        { id: 'documents', label: 'Documents', icon: <FileCheck2 size={14} />, action: () => router.visit(`/documents?search=${encodeURIComponent(project.dossierNumber)}`), danger: false },
        { id: 'finance', label: 'Finance', icon: <BadgeDollarSign size={14} />, action: () => router.visit(`/finance/documents?search=${encodeURIComponent(project.dossierNumber)}`), danger: false },
    ];

    return (
        <div className="relative inline-flex" data-row-menu>
            <button type="button" onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="flex size-7 items-center justify-center rounded-lg border border-transparent text-[var(--text-muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
                <MoreHorizontal size={14} />
            </button>
            {isOpen ? (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[150px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl"
                    onClick={(e) => e.stopPropagation()}>
                    {items.map((item) => (
                        <button key={item.id} type="button" onClick={() => { item.action(); }}
                            className={cn(
                                'flex h-[32px] w-full items-center gap-2 rounded-lg px-2.5 text-left text-[12px] font-medium transition',
                                item.danger
                                    ? 'text-[var(--danger)] hover:bg-[var(--danger)]/10'
                                    : 'text-[var(--foreground)] hover:bg-[var(--surface-2)]',
                            )}>
                            <span className="flex size-[14px] shrink-0 items-center justify-center">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function ProjectCard({ project, openMenuId, setOpenMenuId }: {
    project: DossierLocationRow; openMenuId: number | null; setOpenMenuId: (v: number | null) => void;
}) {
    return (
        <div className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition hover:border-[var(--accent)]/30 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                        <FolderKanban size={16} />
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[var(--foreground)]">
                            {project.projectObject || project.dossierNumber}
                        </p>
                        <p className="truncate text-[11px] text-[var(--text-muted)]">{project.dossierNumber}</p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                    <StatusPill label={project.status} color={statusColor(project.status)} size="sm" />
                    <AppButton variant="solid" color="primary" size="sm" className="h-7 min-w-0 px-2.5 text-[11px]" onPress={() => router.visit(`/dossiers/${project.id}`)}>
                        <Eye size={13} />
                        Open
                    </AppButton>
                    <RowMenu project={project} isOpen={openMenuId === project.id}
                        onToggle={() => setOpenMenuId(openMenuId === project.id ? null : project.id)} />
                </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Client</p>
                    <p className="mt-0.5 truncate text-[12px] font-medium text-[var(--foreground)]">{project.ownerName || '-'}</p>
                    <p className="truncate text-[10px] text-[var(--text-muted)]">{project.clientNumber || '-'}</p>
                </div>
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Workflow</p>
                    <p className="mt-0.5 text-[12px] font-medium text-[var(--accent)]">{workflowLabel(project.workflowStep)}</p>
                </div>
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Documents</p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--foreground)]">
                        <FileCheck2 size={12} className="text-[var(--text-muted)]" />
                        {project.documentsCount} docs
                    </p>
                </div>
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Finance</p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--foreground)]">
                        <BadgeDollarSign size={12} className="text-[var(--text-muted)]" />
                        {project.financeDocumentsCount} docs
                    </p>
                    {project.remainingTotal > 0 ? (
                        <p className="truncate text-[10px] text-[var(--text-muted)]">Remaining: {money(project.remainingTotal)}</p>
                    ) : null}
                </div>
            </div>

            {project.projectAddress ? (
                <p className="mt-2 truncate text-[11px] text-[var(--text-muted)]">
                    {project.projectAddress}
                </p>
            ) : null}
        </div>
    );
}
