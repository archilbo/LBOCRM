export const dashboardDesign = {
    title: 'Command Center',
    subtitle: 'Daily architecture office operations in one compact workspace.',
    primaryAction: 'New project',
    kpiOrder: [
        'activeProjects',
        'missingDocuments',
        'pendingAuthorizations',
        'unpaidInvoices',
        'todayPayments',
    ],
    density: {
        tableRows: 8,
        activityRows: 5,
        actionRows: 5,
    },
    routes: {
        workspace: '/workspace',
        projects: '/dossiers',
        documents: '/documents',
        finance: '/finance/documents',
        monthlyFinance: '/finance/documents?tab=monthly',
    },
} as const;