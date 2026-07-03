import { AppDatePicker } from '@/components/ui/AppDatePicker';
import type { FinanceDocumentType } from '@/features/finance/types';

type FinanceDateFieldsProps = {
    type: FinanceDocumentType;
    issueDate: string;
    dueDate: string;
    validUntil: string;
    onChange: (field: 'issueDate' | 'dueDate' | 'validUntil', value: string) => void;
    isIssueDateDisabled?: boolean;
    issueDateDescription?: string;
};

export function FinanceDateFields({ type, issueDate, dueDate, validUntil, onChange, isIssueDateDisabled = false, issueDateDescription }: FinanceDateFieldsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <AppDatePicker
                label="Date emission"
                value={issueDate}
                isDisabled={isIssueDateDisabled}
                description={issueDateDescription}
                onChange={(value) => onChange('issueDate', value)}
            />
            {type === 'invoice' ? (
                <AppDatePicker
                    label="Date echeance"
                    value={dueDate}
                    onChange={(value) => onChange('dueDate', value)}
                />
            ) : null}
            {type === 'quote' ? (
                <AppDatePicker
                    label="Validite devis"
                    value={validUntil}
                    onChange={(value) => onChange('validUntil', value)}
                />
            ) : null}
        </div>
    );
}