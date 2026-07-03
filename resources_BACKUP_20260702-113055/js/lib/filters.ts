export function countByValue<T>(
    rows: T[],
    getter: (row: T) => string | null | undefined,
    value: string,
) {
    return rows.filter((row) => getter(row) === value).length;
}

export function filterByValue<T>(
    rows: T[],
    value: string,
    getter: (row: T) => string | null | undefined,
) {
    if (value === 'all') {
        return rows;
    }

    return rows.filter((row) => getter(row) === value);
}