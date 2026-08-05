import { IconFileAlert, IconHelpCircle, IconAlertTriangle } from '@tabler/icons-react';

import { Chip } from '@heroui/react';

export function DesignFormatUnsupportedState({ filename, extension, mimeType, message }: {
    filename: string;
    extension?: string;
    mimeType?: string;
    message?: string;
}) {
    const displayMsg = message
        ?? `The format ${extension ? extension.toUpperCase() : (mimeType ?? 'unknown')} is not supported for browser preview.`;

    return (
        <div className="flex h-full flex-col items-center justify-center p-8">
            <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/10">
                    <IconFileAlert size={28} className="text-amber-400" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-[var(--foreground)]">Unsupported format</h3>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">{filename}</p>

                <div className="mt-3 flex justify-center gap-1.5">
                    {extension && (
                        <Chip size="sm" variant="flat" color="warning" className="h-5 text-[9px]">{extension.toUpperCase()}</Chip>
                    )}
                    {mimeType && (
                        <Chip size="sm" variant="flat" color="default" className="h-5 text-[9px]">{mimeType}</Chip>
                    )}
                </div>

                <div className="mt-4 rounded-lg border border-amber-200/50 bg-amber-50/50 px-4 py-3 text-left dark:border-amber-800/20 dark:bg-amber-900/5">
                    <div className="flex items-start gap-2">
                        <IconHelpCircle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                        <p className="text-[10px] leading-relaxed text-amber-700 dark:text-amber-400">{displayMsg}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
