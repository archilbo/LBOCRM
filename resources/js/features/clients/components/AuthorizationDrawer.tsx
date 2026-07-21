import type { Key } from 'react';
import { FormEvent, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextarea } from '@/components/ui/AppTextarea';
import { DateField } from '@/features/archives/components/DateField';
import { strToDate, dateToStr } from '@/lib/dateUtils';
import { useTranslation } from '@/lib/i18n';
import type { ClientSelectedProjectWorkspace } from '@/features/clients/types';

type Props = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    project: ClientSelectedProjectWorkspace | null;
    clientId: number;
};

const STATUS_OPTIONS = [
    { id: 'not_started' as Key, label: 'Not started' },
    { id: 'submitted' as Key, label: 'Submitted' },
    { id: 'observations' as Key, label: 'Observations' },
    { id: 'approved' as Key, label: 'Approved' },
    { id: 'received' as Key, label: 'Received' },
];

const AUTHORITY_OPTIONS = [
    { id: 'commune' as Key, label: 'Commune' },
    { id: 'province' as Key, label: 'Province / Prefecture' },
    { id: 'agency' as Key, label: 'Urban agency' },
];

export function AuthorizationDrawer({ isOpen, onOpenChange, project, clientId }: Props) {
    const { t } = useTranslation();
    const [authorityName, setAuthorityName] = useState('');
    const [authorityType, setAuthorityType] = useState<Key>('commune');
    const [submissionNumber, setSubmissionNumber] = useState('');
    const [authorizationNumber, setAuthorizationNumber] = useState('');
    const [status, setStatus] = useState<Key>('not_started');
    const [submittedAt, setSubmittedAt] = useState('');
    const [approvedAt, setApprovedAt] = useState('');
    const [observationsText, setObservationsText] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const existingAuth = project?.authorization;

    useEffect(() => {
        if (!isOpen) return;
        if (existingAuth) {
            setAuthorityName(existingAuth.authorityName ?? '');
            setAuthorityType('commune');
            setSubmissionNumber(existingAuth.submissionNumber ?? '');
            setAuthorizationNumber(existingAuth.authorizationNumber ?? '');
            setStatus(existingAuth.status as Key ?? 'not_started');
            setSubmittedAt(existingAuth.submittedAt ?? '');
            setApprovedAt(existingAuth.approvedAt ?? '');
            setObservationsText('');
            setNotes('');
        } else {
            setAuthorityName('');
            setAuthorityType('commune');
            setSubmissionNumber('');
            setAuthorizationNumber('');
            setStatus('not_started');
            setSubmittedAt('');
            setApprovedAt('');
            setObservationsText('');
            setNotes('');
        }
    }, [isOpen, existingAuth]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!project) return;
        setSubmitting(true);

        const payload: Record<string, unknown> = {
            dossier_id: project.id,
            authority_name: authorityName || null,
            authority_type: authorityType === 'commune' ? 'commune' : authorityType === 'province' ? 'province' : 'agency',
            submission_number: submissionNumber || null,
            authorization_number: authorizationNumber || null,
            status: String(status),
            submitted_at: submittedAt || null,
            approved_at: approvedAt || null,
            observations_text: observationsText || null,
            notes: notes || null,
        };

        const returnUrl = `/clients/${clientId}?tab=workflow&dossier_id=${project.id}`;
        payload.return_to = returnUrl;

        const isUpdate = !!existingAuth;
        const method = isUpdate ? 'put' as const : 'post' as const;
        const url = isUpdate ? `/authorizations/${existingAuth!.id}` : '/authorizations';

        router[method](url, payload, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isUpdate ? 'Authorization updated.' : 'Authorization created.');
                onOpenChange(false);
            },
            onError: (errors) => {
                toast.error(Object.values(errors).join(', ') || 'Failed to save authorization.');
            },
            onFinish: () => setSubmitting(false),
        });
    }

    if (!project) return null;

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={existingAuth ? 'Edit authorization' : 'Create authorization'}
            description={`${project.dossierNumber} \u2014 ${project.projectObject || ''}`}
            footer={(
                <div className="flex items-center justify-end gap-2">
                    <AppButton variant="bordered" onPress={() => onOpenChange(false)}>
                        {t('clients.cancel')}
                    </AppButton>
                    <AppButton variant="solid" isLoading={submitting} onPress={handleSubmit as VoidFunction}>
                        {existingAuth ? t('clients.save') : t('clients.create')}
                    </AppButton>
                </div>
            )}
        >
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                    <AppInput label="Authority name" value={authorityName} onChange={setAuthorityName} placeholder="e.g. Commune de Marrakech" />
                    <AppSelect label="Authority type" options={AUTHORITY_OPTIONS} selectedKey={authorityType} onSelectionChange={setAuthorityType} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <AppInput label="Submission number" value={submissionNumber} onChange={setSubmissionNumber} placeholder="e.g. SUB-2024-001" />
                    <AppInput label="Authorization number" value={authorizationNumber} onChange={setAuthorizationNumber} placeholder="e.g. AUT-2024-001" />
                </div>

                <AppSelect label="Status" options={STATUS_OPTIONS} selectedKey={status} onSelectionChange={setStatus} />

                <div className="grid grid-cols-2 gap-3">
                    <DateField label="Submitted date" value={strToDate(submittedAt)} onChange={(d) => setSubmittedAt(dateToStr(d))} />
                    <DateField label="Approved date" value={strToDate(approvedAt)} onChange={(d) => setApprovedAt(dateToStr(d))} />
                </div>

                <AppTextarea label="Observations" value={observationsText} onChange={setObservationsText} placeholder="Authority observations..." />
                <AppTextarea label="Notes" value={notes} onChange={setNotes} placeholder="Internal notes..." />
            </form>
        </AppDrawer>
    );
}
