import { Fragment, useMemo, type ButtonHTMLAttributes, type CSSProperties, type DetailedHTMLProps } from 'react';
import { IconChevronRight, IconUserCircle } from '@tabler/icons-react';

import { Chip, ListBox, Tooltip } from '@heroui/react';
import {
    CATEGORY_COLORS,
    categoryOf,
    isKnownStatus,
    normalizeStatus,
    TYPE_ICONS,
    type BackendSearchResult,
} from './globalSearchTypes';

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Stored archive numbers follow {CITYCODE}-{YEAR}-{SEQ:04d} (e.g.
 * BNG-2026-0001). Chips display the compact form {CITYCODE}-{SEQ} (BNG-0001):
 * the year segment is dropped, anything unexpected is left untouched.
 */
function archiveNumberWithoutYear(archiveNumber: string): string {
    const parts = archiveNumber.split('-');
    if (parts.length < 3) return archiveNumber;
    parts.splice(parts.length - 2, 1);
    return parts.join('-');
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
    const needle = query.trim();

    if (needle.length < 2) {
        return <>{text}</>;
    }

    const parts = text.split(new RegExp(`(${escapeRegExp(needle)})`, 'gi'));

    return (
        <>
            {parts.map((part, index) =>
                index % 2 === 1 ? (
                    <mark
                        key={index}
                        className="rounded-[2px] bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] px-0.5 text-inherit"
                    >
                        {part}
                    </mark>
                ) : (
                    part
                ),
            )}
        </>
    );
}

export function GlobalSearchResultItem({
    result,
    query,
    onOpenArchive,
}: {
    result: BackendSearchResult;
    query: string;
    onOpenArchive?: (href: string) => void;
}) {
    const Icon = TYPE_ICONS[result.type] ?? TYPE_ICONS.Document;
    const categoryColor = CATEGORY_COLORS[categoryOf(result.type) as keyof typeof CATEGORY_COLORS];
    const status = normalizeStatus(result.badge);
    const showStatusChip = !result.archive && isKnownStatus(result.badge);

    const meta = result.meta ?? [];

    const archive = result.archive;
    const archiveHref = archive?.href ?? null;
    const cityColor = archive?.cityColor ?? null;

    // Theme the chip with the archive's city color when available; the class
    // tokens below remain the neutral fallback (inline style wins when set).
    const cityColorTheme = cityColor
        ? ({
              borderColor: `color-mix(in_srgb, ${cityColor} 35%, transparent)`,
              '--chip-bg': `color-mix(in_srgb, ${cityColor} 15%, var(--surface))`,
              '--chip-fg': `color-mix(in_srgb, ${cityColor} 80%, var(--text))`,
          } as CSSProperties)
        : undefined;

    const archiveChipLabel = useMemo(() => {
        // Compact archive identity: city + number without the year segment
        // (BENGUERIR - BNG-0001). The room stays in the subtitle line.
        const parts = [result.archive?.city, result.archive?.number && archiveNumberWithoutYear(result.archive.number)].filter(
            (piece): piece is string => typeof piece === 'string' && piece.trim() !== '',
        );

        return parts.join(' - ');
    }, [result.archive]);

    const archiveChip = archive && archiveChipLabel && archiveHref ? (
        <Tooltip delay={450}>
            <Tooltip.Trigger className="flex max-w-full min-w-0">
                <Chip
                    size="sm"
                    variant="soft"
                    className="h-5 min-h-0 max-w-full cursor-pointer border border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] px-1.5 text-[9.5px] font-medium transition-opacity motion-reduce:transition-none hover:opacity-80 [--chip-bg:var(--secondary-soft)] [--chip-fg:var(--secondary-soft-foreground)]"
                    style={cityColorTheme}
                    render={({ className, children, ...domProps }) => (
                        <button
                            type="button"
                            className={className}
                            {...(domProps as unknown as DetailedHTMLProps<
                                ButtonHTMLAttributes<HTMLButtonElement>,
                                HTMLButtonElement
                            >)}
                            onClick={(event) => {
                                event.stopPropagation();
                                onOpenArchive?.(archiveHref);
                            }}
                            onPointerDown={(event) => event.stopPropagation()}
                            onPointerUp={(event) => event.stopPropagation()}
                        >
                            {children}
                        </button>
                    )}
                >
                    <span className="flex min-w-0 items-center gap-1">
                        {archive.cityColor ? (
                            <span
                                aria-hidden="true"
                                className="size-[6px] shrink-0 rounded-full"
                                style={{ backgroundColor: archive.cityColor }}
                            />
                        ) : null}
                        <span className="truncate">{archiveChipLabel}</span>
                    </span>
                </Chip>
            </Tooltip.Trigger>
            <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
                {archiveChipLabel}
            </Tooltip.Content>
        </Tooltip>
    ) : null;

    const responsableName = archive?.requestedBy?.trim();
    const responsableChip = archive && responsableName && archiveHref ? (
        <Tooltip delay={450}>
            <Tooltip.Trigger className="flex max-w-full min-w-0">
                <Chip
                    size="sm"
                    variant="soft"
                    className="h-5 min-h-0 max-w-full cursor-pointer border border-[color-mix(in_srgb,var(--foreground)_18%,transparent)] px-1.5 text-[9.5px] font-medium transition-opacity motion-reduce:transition-none hover:opacity-80 [--chip-bg:var(--surface-2)] [--chip-fg:var(--text-muted)]"
                    render={({ className, children, ...domProps }) => (
                        <button
                            type="button"
                            className={className}
                            {...(domProps as unknown as DetailedHTMLProps<
                                ButtonHTMLAttributes<HTMLButtonElement>,
                                HTMLButtonElement
                            >)}
                            onClick={(event) => {
                                event.stopPropagation();
                                onOpenArchive?.(archiveHref);
                            }}
                            onPointerDown={(event) => event.stopPropagation()}
                            onPointerUp={(event) => event.stopPropagation()}
                        >
                            {children}
                        </button>
                    )}
                >
                    <span className="flex min-w-0 items-center gap-1">
                        <IconUserCircle size={10} aria-hidden="true" className="shrink-0" />
                        <span className="truncate">{responsableName}</span>
                    </span>
                </Chip>
            </Tooltip.Trigger>
            <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
                {responsableName}
            </Tooltip.Content>
        </Tooltip>
    ) : null;

    return (
        <ListBox.Item
            id={result.id}
            textValue={`${result.title} ${result.subtitle ?? ''}`}
            className="group relative mb-2 mx-1 grid min-h-[42px] min-w-0 grid-cols-[28px_minmax(0,1fr)] items-center gap-x-2 gap-y-0 rounded-[9px] bg-[color-mix(in_srgb,var(--surface-2)_45%,var(--surface))] px-2 py-2 text-left outline-none transition-colors motion-reduce:transition-none last:mb-3 data-[hovered]:bg-[color-mix(in_srgb,var(--accent)_8%,color-mix(in_srgb,var(--surface-2)_45%,var(--surface)))] data-[focused]:bg-[color-mix(in_srgb,var(--accent)_10%,color-mix(in_srgb,var(--surface-2)_45%,var(--surface)))] data-[focused]:ring-1 data-[focused]:ring-inset data-[focused]:ring-[color-mix(in_srgb,var(--accent)_35%,transparent)] data-[pressed]:bg-[color-mix(in_srgb,var(--accent)_14%,color-mix(in_srgb,var(--surface-2)_45%,var(--surface)))]"
        >
            {/* Icon tile — spans both data rows */}
            <span
                aria-hidden="true"
                style={{ color: categoryColor }}
                className="row-span-2 flex size-7 shrink-0 items-center justify-center self-center rounded-md"
            >
                <Icon size={14} />
            </span>

            {/* Row 1 — title + archive chip + trailing status/chevron */}
            <div className="flex min-w-0 items-center gap-1.5">
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold leading-[16px] text-[var(--text)]">
                    <HighlightMatch text={result.title} query={query} />
                </span>
                {archiveChip ? <div className="min-w-0 shrink-0">{archiveChip}</div> : null}
                {responsableChip ? <div className="min-w-0 shrink-0">{responsableChip}</div> : null}
                {showStatusChip && status.label ? (
                    <Chip size="sm" variant="soft" color={status.tone} className="h-[18px] min-h-0 max-sm:hidden px-1.5 text-[9px]">
                        {status.label}
                    </Chip>
                ) : null}
                <IconChevronRight
                    size={12}
                    aria-hidden="true"
                    className="shrink-0 text-[var(--text-subtle)] opacity-40 transition-[opacity,color,transform] duration-150 motion-reduce:transition-none group-hover:text-[var(--accent)] group-hover:opacity-100 group-data-[focused]:translate-x-[1px] group-data-[focused]:text-[var(--accent)] group-data-[focused]:opacity-100 motion-reduce:group-data-[focused]:translate-x-0"
                />
            </div>

            {/* Row 2 — details line */}
            <div className="flex min-w-0 items-center gap-1.5">
                <span className="min-w-0 truncate text-[10.5px] leading-[14px] text-[var(--text-muted)]">
                    <HighlightMatch text={result.subtitle} query={query} />
                    {meta.length > 0
                        ? meta.map((piece, index) => (
                              <Fragment key={index}>
                                  <span aria-hidden="true" className="text-[var(--text-subtle)]">
                                      {' '}·{' '}
                                  </span>
                                  <HighlightMatch text={piece} query={query} />
                              </Fragment>
                          ))
                        : null}
                </span>
            </div>
        </ListBox.Item>
    );
}
