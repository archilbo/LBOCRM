import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Download, FileSpreadsheet, FileText, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { FinanceMoneyCell } from '@/features/finance/components/FinanceMoneyCell';
import { FinanceStatusBadge } from '@/features/finance/components/FinanceStatusBadge';
import type { FinanceDocument } from '@/features/finance/types';

type PageProps = {
    document?: FinanceDocument | { data?: FinanceDocument };
};

function unwrapDocument(document?: FinanceDocument | { data?: FinanceDocument }): FinanceDocument | null {
    if (!document) {
        return null;
    }

    if ('data' in document && document.data) {
        return document.data;
    }

    return document as FinanceDocument;
}

function generateFile(url: string | null | undefined, label: string) {
    if (!url) {
        toast.error('Action indisponible.');
        return;
    }

    router.put(url, {}, {
        preserveScroll: true,
        onStart: () => toast.loading(`${label} en cours...`, { id: label }),
        onSuccess: () => toast.success(`${label} termine.`, { id: label }),
        onError: () => toast.error(`${label} impossible.`, { id: label }),
    });
}

function revealFiles(url: string | null | undefined) {
    if (!url) {
        toast.error('Aucun emplacement disponible.');
        return;
    }

    router.post(url, {}, {
        preserveScroll: true,
        onSuccess: () => toast.success('Emplacement ouvert dans Explorer.'),
        onError: () => toast.error('Impossible d ouvrir Explorer.'),
    });
}

function downloadFile(url: string | null | undefined) {
    if (!url) {
        toast.error('Fichier indisponible.');
        return;
    }

    window.open(url, '_blank');
}

export default function FinanceDocumentShow({ document: rawDocument }: PageProps) {
    const document = unwrapDocument(rawDocument);

    if (!document) {
        return (
            <AppShell titleKey="financeWorkspace.title" subtitleKey="financeWorkspace.subtitle">
                <AppCard className="p-6">
                    <p className="text-sm text-[var(--text-muted)]">Document introuvable.</p>
                </AppCard>
            </AppShell>
        );
    }

    return (
        <>
            <Head title={document.number} />

            <AppShell
                eyebrowKey="financeWorkspace.eyebrow"
                titleKey="financeWorkspace.title"
                subtitleKey="financeWorkspace.subtitle"
                action={
                    <div className="flex flex-wrap gap-2">
                        <AppButton variant="secondary" onPress={() => router.visit('/finance')}>
                            <ArrowLeft size={16} />
                            Retour finance
                        </AppButton>
                        {document.pdfDownloadUrl ? (
                            <AppButton variant="secondary" onPress={() => downloadFile(document.pdfDownloadUrl)}>
                                <Download size={16} />
                                PDF
                            </AppButton>
                        ) : (
                            <AppButton variant="secondary" onPress={() => generateFile(document.generatePdfUrl, 'Generation PDF')}>
                                <FileText size={16} />
                                Generer PDF
                            </AppButton>
                        )}
                        {document.excelDownloadUrl || document.downloadUrl ? (
                            <AppButton variant="secondary" onPress={() => downloadFile(document.excelDownloadUrl || document.downloadUrl)}>
                                <FileSpreadsheet size={16} />
                                Excel
                            </AppButton>
                        ) : (
                            <AppButton variant="secondary" onPress={() => generateFile(document.generateExcelUrl, 'Generation Excel')}>
                                <FileSpreadsheet size={16} />
                                Generer Excel
                            </AppButton>
                        )}
                        {document.revealFilesUrl ? (
                            <AppButton variant="secondary" onPress={() => revealFiles(document.revealFilesUrl)}>
                                <FolderOpen size={16} />
                                Explorer
                            </AppButton>
                        ) : null}
                    </div>
                }
            >
                <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                    <AppCard className="p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{document.typeLabel}</p>
                                <h2 className="mt-2 text-2xl font-semibold">{document.number}</h2>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">Date: {document.issueDate || '-'}</p>
                            </div>
                            <FinanceStatusBadge status={document.status} />
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <InfoBlock title="Client" lines={[document.client?.name, document.client?.cin, document.client?.address]} />
                            <InfoBlock title="Dossier" lines={[document.dossier?.number, document.dossier?.projectObject, document.dossier?.address]} />
                        </div>
                    </AppCard>

                    <AppCard className="p-5">
                        <h3 className="text-sm font-semibold">Totaux</h3>
                        <div className="mt-4 space-y-3 text-sm">
                            <TotalLine label="HT" value={document.subtotalHt} currency={document.currency} />
                            <TotalLine label="Remise" value={document.discountTotal} currency={document.currency} />
                            <TotalLine label="TVA" value={document.taxTotal} currency={document.currency} />
                            <TotalLine label="Total TTC" value={document.totalTtc} currency={document.currency} strong />
                            <TotalLine label="Paye" value={document.paidTotal} currency={document.currency} tone="success" />
                            <TotalLine label="Restant" value={document.remainingTotal} currency={document.currency} tone="danger" />
                        </div>
                    </AppCard>
                </div>

                <AppCard className="overflow-hidden p-0">
                    <div className="border-b p-5">
                        <h3 className="text-sm font-semibold">Lignes du document</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[var(--surface-2)] text-left text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                <tr>
                                    <th className="px-5 py-3">Designation</th>
                                    <th className="px-5 py-3 text-right">Qt</th>
                                    <th className="px-5 py-3 text-right">PU HT</th>
                                    <th className="px-5 py-3 text-right">TVA</th>
                                    <th className="px-5 py-3 text-right">Total TTC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {document.items?.length ? document.items.map((item) => (
                                    <tr key={item.id || item.position} className="border-t">
                                        <td className="px-5 py-3">
                                            <p className="font-medium">{item.title || '-'}</p>
                                            <p className="text-xs text-[var(--text-muted)]">{item.description || ''}</p>
                                        </td>
                                        <td className="px-5 py-3 text-right">{item.quantity} {item.unit || ''}</td>
                                        <td className="px-5 py-3 text-right"><FinanceMoneyCell value={item.unitPrice} currency={document.currency} /></td>
                                        <td className="px-5 py-3 text-right">{item.tvaRate}%</td>
                                        <td className="px-5 py-3 text-right"><FinanceMoneyCell value={item.totalTtc} currency={document.currency} /></td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-8 text-center text-[var(--text-muted)]">Aucune ligne.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </AppCard>

                <div className="grid gap-5 xl:grid-cols-2">
                    <AppCard className="p-5">
                        <h3 className="text-sm font-semibold">Notes</h3>
                        <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--text-muted)]">{document.notes || 'Aucune note.'}</p>
                        <h3 className="mt-5 text-sm font-semibold">Conditions</h3>
                        <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--text-muted)]">{document.terms || 'Aucune condition.'}</p>
                    </AppCard>

                    <AppCard className="p-5">
                        <h3 className="text-sm font-semibold">Fichiers generes</h3>
                        <div className="mt-4 space-y-3 text-sm">
                            <FileLine label="PDF" value={document.pdfPath} />
                            <FileLine label="Excel" value={document.excelPath} />
                            <FileLine label="Generation" value={document.generatedAt} />
                        </div>
                    </AppCard>
                </div>
            </AppShell>
        </>
    );
}

function InfoBlock({ title, lines }: { title: string; lines: Array<string | number | null | undefined> }) {
    return (
        <div className="rounded-2xl border bg-[var(--surface-2)] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{title}</h3>
            <div className="mt-3 space-y-1 text-sm">
                {lines.filter(Boolean).length ? lines.filter(Boolean).map((line, index) => (
                    <p key={`${title}-${index}`}>{line}</p>
                )) : <p className="text-[var(--text-muted)]">-</p>}
            </div>
        </div>
    );
}

function TotalLine({ label, value, currency, strong, tone }: { label: string; value: number; currency: string; strong?: boolean; tone?: 'success' | 'danger' }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b pb-2 last:border-0">
            <span className={strong ? 'font-semibold' : ''}>{label}</span>
            <FinanceMoneyCell value={value} currency={currency} tone={tone || 'default'} />
        </div>
    );
}

function FileLine({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b pb-2 last:border-0">
            <span>{label}</span>
            <span className="max-w-[260px] truncate text-right text-[var(--text-muted)]">{value || '-'}</span>
        </div>
    );
}
