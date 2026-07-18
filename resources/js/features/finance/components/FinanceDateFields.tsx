import { Card, Input } from '@heroui/react';
import { Calendar } from 'lucide-react';
import type { FinanceDocumentType } from '@/features/finance/types';

type FinanceDateFieldsProps = {
    type: FinanceDocumentType;
    issueDate: string;
    dueDate: string;
    validUntil: string;
    onChange: (field: 'issueDate' | 'dueDate' | 'validUntil', value: string) => void;
    isIssueDateDisabled?: boolean;
    isDisabled?: boolean;
};

const labelCls = 'text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]';
const compactInput = 'h-8 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]';

export function FinanceDateFields({ type, issueDate, dueDate, validUntil, onChange, isIssueDateDisabled = false, isDisabled = false }: FinanceDateFieldsProps) {
    return (
            <Card className="p-3 space-y-3">
            <div className="flex items-center gap-1.5 mb-2"><Calendar size={13} className="text-[var(--text-subtle)]" /><p className={labelCls}>Dates</p></div>
            <div className="grid gap-2 sm:grid-cols-3">
                <div className="flex min-w-0 flex-col gap-1">
                    <label className={labelCls}>Date emission</label>
                    <Input className={compactInput} type="date" value={issueDate} isDisabled={isIssueDateDisabled || isDisabled} onChange={(e) => onChange('issueDate', e.target.value)} />
                </div>
                {type === 'invoice' ? (
                    <div className="flex min-w-0 flex-col gap-1">
                        <label className={labelCls}>Date echeance</label>
                        <Input className={compactInput} type="date" value={dueDate} isDisabled={isDisabled} onChange={(e) => onChange('dueDate', e.target.value)} />
                    </div>
                ) : null}
                {type === 'quote' ? (
                    <div className="flex min-w-0 flex-col gap-1">
                        <label className={labelCls}>Validite devis</label>
                        <Input className={compactInput} type="date" value={validUntil} isDisabled={isDisabled} onChange={(e) => onChange('validUntil', e.target.value)} />
                    </div>
                ) : null}
            </div>
        </Card>
    );
}
