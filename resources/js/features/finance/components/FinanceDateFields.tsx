import { Card } from '@heroui/react';
import { IconCalendar } from '@tabler/icons-react';

import { DateField } from '@/features/archives/components/DateField';
import { strToDate, dateToStr } from '@/lib/dateUtils';
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

const labelCls = 'text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]';

export function FinanceDateFields({ type, issueDate, dueDate, validUntil, onChange, isIssueDateDisabled = false, isDisabled = false }: FinanceDateFieldsProps) {
    return (
        <Card className="p-3 space-y-3">
            <div className="flex items-center gap-1.5 mb-2"><IconCalendar size={13} className="text-[var(--text-subtle)]" /><p className={labelCls}>Dates</p></div>
            <div className="grid gap-2 sm:grid-cols-3">
                <DateField label="Date emission" value={strToDate(issueDate)} onChange={(d) => onChange('issueDate', dateToStr(d))} isDisabled={isIssueDateDisabled || isDisabled} />
                {type === 'invoice' ? (
                    <DateField label="Date echeance" value={strToDate(dueDate)} onChange={(d) => onChange('dueDate', dateToStr(d))} isDisabled={isDisabled} />
                ) : null}
                {type === 'quote' ? (
                    <DateField label="Validite devis" value={strToDate(validUntil)} onChange={(d) => onChange('validUntil', dateToStr(d))} isDisabled={isDisabled} />
                ) : null}
            </div>
        </Card>
    );
}
