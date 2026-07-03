import { ReactNode } from 'react';
import { FileTrigger } from 'react-aria-components';
import { Upload } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';

type DocumentUploadCardProps = {
    title: string;
    description: string;
    acceptedText: string;
    chooseLabel: string;
    icon?: ReactNode;
    onSelect: (fileName: string) => void;
};

export function DocumentUploadCard({
    title,
    description,
    acceptedText,
    chooseLabel,
    icon,
    onSelect,
}: DocumentUploadCardProps) {
    return (
        <AppCard className="p-4">
            <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                    {icon ?? <Upload size={18} />}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">
                        {description}
                    </p>
                    <p className="mt-2 text-xs text-[var(--text-subtle)]">
                        {acceptedText}
                    </p>

                    <div className="mt-4">
                        <FileTrigger
                            acceptedFileTypes={[
                                'application/pdf',
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                'image/jpeg',
                                'image/png',
                            ]}
                            onSelect={(files) => {
                                const file = files?.item(0);
                                if (file) {
                                    onSelect(file.name);
                                }
                            }}
                        >
                            <AppButton size="sm" variant="primary">
                                <Upload size={15} />
                                {chooseLabel}
                            </AppButton>
                        </FileTrigger>
                    </div>
                </div>
            </div>
        </AppCard>
    );
}
