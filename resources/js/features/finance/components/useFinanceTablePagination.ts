import { useEffect, useMemo, useState } from 'react';

export function useFinanceTablePagination<T>(rows: T[], pageSize = 10) {
    const [requestedPage, setRequestedPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = Math.min(requestedPage, totalPages);
    const startIndex = (page - 1) * pageSize;

    useEffect(() => {
        if (requestedPage !== page) setRequestedPage(page);
    }, [page, requestedPage]);

    const paginatedRows = useMemo(
        () => rows.slice(startIndex, startIndex + pageSize),
        [rows, startIndex, pageSize],
    );

    return {
        page,
        pageSize,
        total: rows.length,
        startIndex,
        paginatedRows,
        setPage: setRequestedPage,
        goToLastPage: (totalRows = rows.length) => setRequestedPage(Math.max(1, Math.ceil(totalRows / pageSize))),
    };
}
