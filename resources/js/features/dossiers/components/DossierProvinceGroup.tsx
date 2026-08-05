import { IconChevronDown, IconMap } from '@tabler/icons-react';

import { useState } from 'react';
import type { DossierLocationGroup } from '@/features/dossiers/types';
import { DossierCommuneGroup } from './DossierCommuneGroup';
import { DossierLocationStats } from './DossierLocationStats';

type Props = {
    group: DossierLocationGroup;
};

export function DossierProvinceGroup({ group }: Props) {
    const [open, setOpen] = useState(true);

    return (
        <section className="crm-panel overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-3 border-b border-[var(--crm-border)] px-4 py-4 text-left transition hover:bg-[var(--crm-surface-hover)]"
            >
                <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                        <IconMap size={18} />
                    </span>

                    <span className="min-w-0">
                        <span className="block truncate text-base font-semibold text-[var(--crm-text)]">{group.province}</span>
                        <span className="text-xs text-[var(--crm-text-muted)]">
                            {group.communes.length} commune(s) · {group.stats.projectsCount} project(s)
                        </span>
                    </span>
                </span>

                <IconChevronDown size={18} className={open ? 'shrink-0 transition' : 'shrink-0 -rotate-90 transition'} />
            </button>

            {open ? (
                <div className="space-y-4 p-4">
                    <DossierLocationStats stats={group.stats} />

                    <div className="space-y-3">
                        {group.communes.map((commune) => (
                            <DossierCommuneGroup key={`${group.province}-${commune.commune}`} group={commune} />
                        ))}
                    </div>
                </div>
            ) : null}
        </section>
    );
}