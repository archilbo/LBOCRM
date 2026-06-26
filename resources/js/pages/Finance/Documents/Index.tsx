import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { FileText, Plus, ReceiptText, WalletCards } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { TabPanel } from 'react-aria-components';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { FinanceDocumentActions } from '@/features/finance/components/FinanceDocumentActions';
import { FinanceMetricCards, type FinanceMetrics } from '@/features/finance/components/FinanceMetricCards';
import { FinanceMoneyCell } from '@/features/finance/components/FinanceMoneyCell';
import { FinanceStatusBadge } from '@/features/finance/components/FinanceStatusBadge';
import { FinanceTabs } from '@/features/finance/components/FinanceTabs';
import { FinanceDocumentBuilderDrawer } from '@/features/finance/drawers/FinanceDocumentBuilderDrawer';
import { PaymentDrawer } from '@/features/finance/drawers/PaymentDrawer';
import type { ClientOption, DossierOption, FinanceDocument, FinanceDocumentType, FinanceSettings, Payment, TemplateOption } from '@/features/finance/types';

const defaultSettings: FinanceSettings = {
    defaultTvaRate: 20,
    defaultCurrency: 'MAD',
    defaultPaymentTermsDays: 30,
    defaultQuoteValidityDays: 30,
    defaultUnitPriceM2: 0,
    defaultArchitectRate: 0,
    companyInfo: {},
    bankInfo: {},
};

type Paginated<T> = {
    data: T[];
};

type PageProps = {
    documents?: Paginated<FinanceDocument> | FinanceDocument[];
    payments?: Paginated<Payment> | Payment[];
    metrics?: Partial<FinanceMetrics>;
    clients?: ClientOption[];
    dossiers?: DossierOption[];
    templates?: TemplateOption[];
    settings?: Partial<FinanceSettings>;
};

function unwrap<T>(value?: Paginated<T> | T[]): T[] {
    if (!value) {
        return [];
    }

    return Array.isArray(value) ? value : value.data || [];
}

export default function FinanceDocumentsIndex({
    documents: rawDocuments,
    payments: rawPayments,
    metrics: rawMetrics,
    clients = [],
    dossiers = [],
    templates = [],
    settings: rawSettings,
}: PageProps) {
    const documents = unwrap(rawDocuments);
    const payments = unwrap(rawPayments);
    const settings = { ...defaultSettings, ...rawSettings };
    const [activeTab, setActiveTab] = useState('overview');
    const [builderOpen, setBuilderOpen] = useState(false);
    const [builderMode, setBuilderMode] = useState<'create' | 'edit'>('create');
    const [builderType, setBuilderType] = useState<FinanceDocumentType>('quote');
    const [selectedDocument, setSelectedDocument] = useState<FinanceDocument | null>(null);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [paymentInvoice, setPaymentInvoice] = useState<FinanceDocument | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<FinanceDocument | null>(null);

    const quotes = useMemo(() => documents.filter((doc) => doc.type === 'quote'), [documents]);
    const invoices = useMemo(() => documents.filter((doc) => doc.type === 'invoice'), [documents]);
    const receipts = useMemo(() => documents.filter((doc) => doc.type === 'receipt'), [documents]);
    const metrics: FinanceMetrics = {
        totalQuotes: rawMetrics?.totalQuotes ?? quotes.reduce((sum, doc) => sum + doc.totalTtc, 0),
        totalInvoices: rawMetrics?.totalInvoices ?? invoices.reduce((sum, doc) => sum + doc.totalTtc, 0),
        paidTotal: rawMetrics?.paidTotal ?? invoices.reduce((sum, doc) => sum + doc.paidTotal, 0),
        remainingTotal: rawMetrics?.remainingTotal ?? invoices.reduce((sum, doc) => sum + doc.remainingTotal, 0),
        overdueTotal: rawMetrics?.overdueTotal ?? invoices.filter((doc) => doc.status === 'overdue').reduce((sum, doc) => sum + doc.remainingTotal, 0),
        draftCount: rawMetrics?.draftCount ?? documents.filter((doc) => doc.status === 'draft').length,
        currency: rawMetrics?.currency ?? settings.defaultCurrency,
    };

    function openCreate(type: FinanceDocumentType) {
        setSelectedDocument(null);
        setBuilderMode('create');
        setBuilderType(type);
        setBuilderOpen(true);
    }

    function openEdit(document: FinanceDocument) {
        setSelectedDocument(document);
        setBuilderMode('edit');
        setBuilderType(document.type);
        setBuilderOpen(true);
    }

    function openPayment(document?: FinanceDocument | null) {
        setPaymentInvoice(document || null);
        setPaymentOpen(true);
    }

    function putAction(url: string | null | undefined, success: string, error: string) {
        if (!url) {
            toast.error('Action non disponible.');
            return;
        }

        router.put(url, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(success),
            onError: () => toast.error(error),
        });
    }

    function postAction(url: string | null | undefined, success: string, error: string) {
        if (!url) {
            toast.error('Action non disponible.');
            return;
        }

        router.post(url, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(success),
            onError: () => toast.error(error),
        });
    }

    function handleDelete() {
        if (!deleteTarget) {
            return;
        }

        router.delete(deleteTarget.deleteUrl || `/finance/documents/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Document supprime.');
                setDeleteTarget(null);
            },
            onError: () => toast.error('Impossible supprimer le document.'),
        });
    }

    const commonActions = {
        onEdit: openEdit,
        onAccept: (document: FinanceDocument) => putAction(document.acceptUrl || `/finance/documents/${document.id}/accept`, 'Devis accepte.', 'Impossible accepter le devis.'),
        onReject: (document: FinanceDocument) => putAction(document.rejectUrl || `/finance/documents/${document.id}/reject`, 'Devis refuse.', 'Impossible refuser le devis.'),
        onConvert: (document: FinanceDocument) => postAction(document.convertToInvoiceUrl || `/finance/documents/${document.id}/convert-to-invoice`, 'Facture creee depuis le devis.', 'Impossible convertir le devis.'),
        onPayment: openPayment,
        onDelete: setDeleteTarget,
    };

    const quoteColumns = useMemo<ColumnDef<FinanceDocument>[]>(() => [
        documentColumn(),
        clientColumn(),
        statusColumn(),
        moneyColumn('Total TTC', 'totalTtc'),
        dateColumn('Validite', 'validUntil'),
        actionsColumn(commonActions),
    ], [documents]);

    const invoiceColumns = useMemo<ColumnDef<FinanceDocument>[]>(() => [
        documentColumn(),
        clientColumn(),
        statusColumn(),
        moneyColumn('Total TTC', 'totalTtc'),
        moneyColumn('Paye', 'paidTotal', 'success'),
        moneyColumn('Restant', 'remainingTotal', 'danger'),
        dateColumn('Echeance', 'dueDate'),
        actionsColumn(commonActions),
    ], [documents]);

    const paymentColumns = useMemo<ColumnDef<Payment>[]>(() => [
        {
            header: 'Paiement',
            accessorKey: 'paymentNumber',
            cell: ({ row }) => <span className="font-semibold">{row.original.paymentNumber}</span>,
        },
        {
            header: 'Facture',
            cell: ({ row }) => row.original.document?.number || '-',
        },
        {
            header: 'Client',
            cell: ({ row }) => row.original.client?.name || '-',
        },
        {
            header: 'Montant',
            cell: ({ row }) => <FinanceMoneyCell value={row.original.amount} currency={settings.defaultCurrency} tone="success" />,
        },
        {
            header: 'Mode',
            accessorKey: 'method',
            cell: ({ row }) => row.original.method || '-',
        },
        {
            header: 'Date paiement',
            accessorKey: 'paidAt',
            cell: ({ row }) => row.original.paidAt || '-',
        },
    ], [settings.defaultCurrency]);

    return (
        <>
            <Head title="Finance" />

            <AppShell
                eyebrowKey="financeWorkspace.eyebrow"
                titleKey="financeWorkspace.title"
                subtitleKey="financeWorkspace.subtitle"
                action={
                    <div className="flex flex-wrap gap-2">
                        <AppButton variant="secondary" onPress={() => openPayment()}>
                            <WalletCards size={16} />
                            Paiement
                        </AppButton>
                        <AppButton variant="secondary" onPress={() => openCreate('invoice')}>
                            <ReceiptText size={16} />
                            Nouvelle facture
                        </AppButton>
                        <AppButton variant="primary" onPress={() => openCreate('quote')}>
                            <Plus size={16} />
                            Nouveau devis
                        </AppButton>
                    </div>
                }
            >
                <FinanceTabs selectedKey={activeTab} onSelectionChange={setActiveTab}>
                    <TabPanel id="overview" className="space-y-5 outline-none">
                        <FinanceMetricCards metrics={metrics} />
                        <div className="grid gap-5 xl:grid-cols-2">
                            <RecentDocuments title="Derniers devis" icon={<FileText size={18} />} documents={quotes.slice(0, 5)} />
                            <RecentDocuments title="Dernieres factures" icon={<ReceiptText size={18} />} documents={invoices.slice(0, 5)} />
                        </div>
                    </TabPanel>

                    <TabPanel id="quotes" className="outline-none">
                        <AppDataTable
                            data={quotes}
                            columns={quoteColumns}
                            searchPlaceholder="Rechercher devis, client, dossier..."
                            emptyTitle="Aucun devis"
                            emptyDescription="Creez le premier devis avec le builder live."
                            pageSize={10}
                        />
                    </TabPanel>

                    <TabPanel id="invoices" className="outline-none">
                        <AppDataTable
                            data={invoices}
                            columns={invoiceColumns}
                            searchPlaceholder="Rechercher facture, client, dossier..."
                            emptyTitle="Aucune facture"
                            emptyDescription="Creez ou convertissez un devis en facture."
                            pageSize={10}
                        />
                    </TabPanel>

                    <TabPanel id="payments" className="outline-none">
                        <AppDataTable
                            data={payments}
                            columns={paymentColumns}
                            searchPlaceholder="Rechercher paiement, facture, client..."
                            emptyTitle="Aucun paiement"
                            emptyDescription="Enregistrez un paiement depuis une facture."
                            pageSize={10}
                        />
                    </TabPanel>

                    <TabPanel id="templates" className="outline-none">
                        <AppCard className="p-6">
                            <AppEmptyState
                                title="Templates finance"
                                description="Les templates disponibles seront geres dans le module documents. Cette vue reste une synthese finance."
                            />
                        </AppCard>
                    </TabPanel>

                    <TabPanel id="settings" className="outline-none">
                        <AppCard className="p-6">
                            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                <p>Devise: <strong>{settings.defaultCurrency}</strong></p>
                                <p>TVA: <strong>{settings.defaultTvaRate}%</strong></p>
                                <p>Delai paiement: <strong>{settings.defaultPaymentTermsDays} jours</strong></p>
                                <p>Validite devis: <strong>{settings.defaultQuoteValidityDays} jours</strong></p>
                            </div>
                        </AppCard>
                    </TabPanel>
                </FinanceTabs>
            </AppShell>

            <FinanceDocumentBuilderDrawer
                isOpen={builderOpen}
                onOpenChange={setBuilderOpen}
                mode={builderMode}
                type={builderType}
                document={selectedDocument}
                clients={clients}
                dossiers={dossiers}
                templates={templates}
                settings={settings}
            />

            <PaymentDrawer
                isOpen={paymentOpen}
                onOpenChange={setPaymentOpen}
                invoices={invoices}
                invoice={paymentInvoice}
            />

            <AppConfirmDialog
                isOpen={Boolean(deleteTarget)}
                title="Supprimer le document ?"
                description={`Confirmer la suppression de ${deleteTarget?.number || 'ce document'}.`}
                confirmLabel="Supprimer"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                variant="danger"
            />
        </>
    );
}

function documentColumn(): ColumnDef<FinanceDocument> {
    return {
        header: 'Numero',
        accessorKey: 'number',
        cell: ({ row }) => (
            <div>
                <p className="font-semibold">{row.original.number}</p>
                <p className="text-xs text-[var(--text-muted)]">{row.original.typeLabel}</p>
            </div>
        ),
    };
}

function clientColumn(): ColumnDef<FinanceDocument> {
    return {
        header: 'Client / Dossier',
        cell: ({ row }) => (
            <div className="min-w-0">
                <p className="truncate font-medium">{row.original.client?.name || '-'}</p>
                <p className="truncate text-xs text-[var(--text-muted)]">{row.original.dossier?.number || '-'} {row.original.dossier?.projectObject || ''}</p>
            </div>
        ),
    };
}

function statusColumn(): ColumnDef<FinanceDocument> {
    return {
        header: 'Statut',
        accessorKey: 'status',
        cell: ({ row }) => <FinanceStatusBadge status={row.original.status} />,
    };
}

function moneyColumn(label: string, key: 'totalTtc' | 'paidTotal' | 'remainingTotal', tone: 'default' | 'success' | 'danger' = 'default'): ColumnDef<FinanceDocument> {
    return {
        header: label,
        accessorKey: key,
        cell: ({ row }) => <FinanceMoneyCell value={row.original[key]} currency={row.original.currency} tone={tone} />,
    };
}

function dateColumn(label: string, key: 'dueDate' | 'validUntil'): ColumnDef<FinanceDocument> {
    return {
        header: label,
        accessorKey: key,
        cell: ({ row }) => row.original[key] || '-',
    };
}

type DocumentActionHandlers = {
    onEdit: (document: FinanceDocument) => void;
    onAccept: (document: FinanceDocument) => void;
    onReject: (document: FinanceDocument) => void;
    onConvert: (document: FinanceDocument) => void;
    onPayment: (document: FinanceDocument) => void;
    onDelete: (document: FinanceDocument) => void;
};

function actionsColumn(actions: DocumentActionHandlers): ColumnDef<FinanceDocument> {
    return {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => <FinanceDocumentActions document={row.original} {...actions} />,
    };
}

function RecentDocuments({ title, icon, documents }: { title: string; icon: ReactNode; documents: FinanceDocument[] }) {
    return (
        <AppCard className="p-5">
            <div className="mb-4 flex items-center gap-2">
                <span className="text-[var(--accent)]">{icon}</span>
                <h2 className="text-sm font-semibold">{title}</h2>
            </div>
            <div className="space-y-3">
                {documents.length > 0 ? documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-[var(--surface)] p-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{document.number}</p>
                            <p className="truncate text-xs text-[var(--text-muted)]">{document.client?.name || '-'}</p>
                        </div>
                        <FinanceMoneyCell value={document.totalTtc} currency={document.currency} />
                    </div>
                )) : (
                    <p className="text-sm text-[var(--text-muted)]">Aucun document recent.</p>
                )}
            </div>
        </AppCard>
    );
}

