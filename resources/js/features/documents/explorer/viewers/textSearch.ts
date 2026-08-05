export type TextMatch = { start: number; end: number };

/** Hard cap so a pathological query can never produce unbounded output. */
const MAX_MATCHES = 1000;

/**
 * Pure, case-insensitive search over the loaded preview. Returns empty when
 * the query is blank; matches never overlap. The cap bounds both the match
 * count display and the number of highlighted segments rendered.
 */
export function findTextMatches(haystack: string, needle: string): TextMatch[] {
    const query = needle.trim().toLocaleLowerCase();

    if (!query || !haystack) {
        return [];
    }

    const lowered = haystack.toLocaleLowerCase();
    const matches: TextMatch[] = [];

    let from = 0;

    while (matches.length < MAX_MATCHES) {
        const index = lowered.indexOf(query, from);

        if (index < 0) {
            break;
        }

        matches.push({ start: index, end: index + query.length });
        from = index + query.length;
    }

    return matches;
}
