import { CheckCircle2, Download, Eye, Landmark, Printer, RotateCcw, ShieldCheck, Trash2, XCircle } from 'lucide-react';
import type { FinanceDocument } from '@/features/finance/types';

type FinanceSidebarActionsProps = {
    document: FinanceDocument;
    isProcessing: boolean;
    onGenerate: () => void;
    onView: () => void;
    onPrint: () => void;
    onDownloadPdf: () => void;
    onDownloadExcel: () => void;
    onAcceptQuote: () => void;
    onRejectQuote: () => void;
    onConvertToInvoice: () => void;
    onCancel: () => void;
    onDelete: () => void;
};

export function FinanceSidebarActions({
    document,
    isProcessing,
    onGenerate,
    onView,
    onPrint,
    onDownloadPdf,
    onDownloadExcel,
    onAcceptQuote,
    onRejectQuote,
    onConvertToInvoice,
    onCancel,
    onDelete,
}: FinanceSidebarActionsProps) {
    const disabled = isProcessing;

    return (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                <ShieldCheck size={14} className="text-amber-500" />
                <h2 className="text-xs font-semibold text-[var(--foreground)]">Actions</h2>
                <span className="ml-auto h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="space-y-4 p-4">

                {/* Export */}
                <div>
                    <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Export</p>
                    <div className="mb-2 grid grid-cols-2 gap-2">
                        <button type="button" onClick={onView} className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 text-[10px] font-semibold text-[var(--text)] transition hover:border-amber-500/30 hover:text-amber-400">
                            <Eye size={13} /> View
                        </button>
                        <button type="button" onClick={onPrint} className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 text-[10px] font-semibold text-[var(--text)] transition hover:border-amber-500/30 hover:text-amber-400">
                            <Printer size={13} /> Print
                        </button>
                    </div>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={onGenerate}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/25 bg-gradient-to-r from-amber-500/20 to-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-400 transition-all hover:from-amber-500/30 hover:to-amber-500/15 hover:border-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RotateCcw size={14} className={disabled ? 'animate-spin' : ''} />
                        Generate PDF + Excel
                    </button>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={onDownloadPdf}
                            className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 text-[10px] font-semibold text-[var(--text-muted)] transition-all hover:border-amber-500/25 hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={13} />
                            PDF
                        </button>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={onDownloadExcel}
                            className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 text-[10px] font-semibold text-[var(--text-muted)] transition-all hover:border-amber-500/25 hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={13} />
                            Excel
                        </button>
                    </div>
                </div>

                {/* Quote workflow */}
                {document.acceptUrl || document.rejectUrl || document.convertToInvoiceUrl ? (
                    <div className="border-t border-[var(--border)] pt-4">
                        <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Quote</p>
                        <div className="grid grid-cols-3 gap-1.5">
                            {document.acceptUrl ? (
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={onAcceptQuote}
                                    className="flex items-center justify-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/15 px-2 py-1.5 text-[10px] font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 size={12} />
                                    Accept
                                </button>
                            ) : null}
                            {document.rejectUrl ? (
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={onRejectQuote}
                                    className="flex items-center justify-center gap-1 rounded-lg border border-red-500/20 bg-red-500/15 px-2 py-1.5 text-[10px] font-semibold text-red-400 transition-all hover:bg-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle size={12} />
                                    Reject
                                </button>
                            ) : null}
                            {document.convertToInvoiceUrl ? (
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={onConvertToInvoice}
                                    className="flex items-center justify-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/15 px-2 py-1.5 text-[10px] font-semibold text-amber-400 transition-all hover:bg-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Landmark size={12} />
                                    Convert
                                </button>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                {/* Cancel & Delete */}
                <div className="border-t border-[var(--border)] pt-4">
                    <p className="mb-2 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-red-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500/60" />
                        Danger zone
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={onCancel}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2 text-xs font-semibold text-[var(--text-muted)] transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RotateCcw size={13} />
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={onDelete}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-900/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 size={13} />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
