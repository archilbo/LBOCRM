import type {
    ClientFormPayload,
} from '@/features/clients/types';
import type {
    CinScanResult,
    CinScannedField,
} from '@/features/clients/cin-scanner/types';

export type AppliedCinField =
    | 'civility'
    | 'firstName'
    | 'lastName'
    | 'cin'
    | 'address'
    | 'fatherName'
    | 'motherName'
    | 'cniExpirationDate';

export type ApplyCinScanOptions = {
    overwriteExisting?: boolean;
};

export type ApplyCinScanResult = {
    form: ClientFormPayload;
    appliedFields: AppliedCinField[];
    reviewFields: string[];
};

function scannedValue(
    field: CinScannedField,
): string | null {
    return field.status !== 'unreadable'
        ? field.value
        : null;
}

export function applyCinScan(
    current: ClientFormPayload,
    scan: CinScanResult,
    options: ApplyCinScanOptions = {},
): ApplyCinScanResult {
    const overwriteExisting =
        options.overwriteExisting ?? false;
    const next = { ...current };
    const appliedFields: AppliedCinField[] = [];
    const reviewFields = Object.entries(
        scan.fields,
    )
        .filter(([, field]) =>
            field.status === 'review'
            && Boolean(field.value),
        )
        .map(([name]) => name);

    function apply(
        field: AppliedCinField,
        value: string | null,
    ): void {
        if (! value) {
            return;
        }

        const currentValue = next[field];

        if (
            ! overwriteExisting
            && typeof currentValue === 'string'
            && currentValue.trim() !== ''
        ) {
            return;
        }

        next[field] = value;
        appliedFields.push(field);
    }

    apply(
        'firstName',
        scannedValue(scan.fields.firstName),
    );
    apply(
        'lastName',
        scannedValue(scan.fields.lastName),
    );
    apply(
        'cin',
        scannedValue(scan.fields.cinNumber),
    );
    apply(
        'address',
        scannedValue(scan.fields.address),
    );
    apply(
        'fatherName',
        scannedValue(scan.fields.fatherName),
    );
    apply(
        'motherName',
        scannedValue(scan.fields.motherName),
    );
    apply(
        'cniExpirationDate',
        scannedValue(scan.fields.expiryDate),
    );

    const sex = scannedValue(scan.fields.sex);

    if (sex === 'M') {
        apply('civility', 'Mr');
    } else if (sex === 'F') {
        apply('civility', 'Ms');
    }

    return {
        form: next,
        appliedFields,
        reviewFields,
    };
}
