import { cn } from '@/lib/cn';

/* ──── Style constants used by all drawers ──── */

export const drawerStyles = {
  trigger:
    'flex h-8 w-full min-w-0 items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] outline-none transition border-[var(--border)] hover:border-[var(--accent)] focus-visible:border-[var(--accent)]',

  popover:
    'z-[70] min-w-[var(--trigger-width)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg',

  item:
    'flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-2)] data-[focus-visible]:bg-[var(--surface-2)] data-[selected]:bg-[var(--accent)]/10',

  input:
    'h-8 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)] aria-invalid:border-[var(--danger)] aria-invalid:ring-2 aria-invalid:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]',

  textarea:
    'min-h-20 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)] aria-invalid:border-[var(--danger)] aria-invalid:ring-2 aria-invalid:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]',

  label:
    'text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]',

  heading:
    'mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]',

  fieldGroup: 'flex min-w-0 flex-col gap-1',

  sectionGrid: 'grid gap-2',

  sectionFlex: 'flex flex-col gap-2',
} as const;

/* ──── Shared drawer prop shape ──── */

export type DrawerBaseProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  errors?: Record<string, string>;
  isSubmitting?: boolean;
};

/* ──── Common select option shape ──── */

export type SelectOption<T extends string = string> = {
  id: T;
  label: string;
};

/* ──── Generic helper to render error text ──── */

export function DrawerError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-[10px] font-medium text-[var(--danger)]">{error}</p>;
}
