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

function verifiedValue(
    field: CinScannedField,
): string | null {
    return field.status === 'verified'
        ? field.value
        : null;
}

export function applyVerifiedCinScan(
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
        verifiedValue(scan.fields.firstName),
    );
    apply(
        'lastName',
        verifiedValue(scan.fields.lastName),
    );
    apply(
        'cin',
        verifiedValue(scan.fields.cinNumber),
    );
    apply(
        'address',
        verifiedValue(scan.fields.address),
    );
    apply(
        'fatherName',
        verifiedValue(scan.fields.fatherName),
    );
    apply(
        'motherName',
        verifiedValue(scan.fields.motherName),
    );
    apply(
        'cniExpirationDate',
        verifiedValue(scan.fields.expiryDate),
    );

    const sex = verifiedValue(scan.fields.sex);

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
