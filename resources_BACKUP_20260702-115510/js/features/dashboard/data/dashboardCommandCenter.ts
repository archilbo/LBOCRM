import {
    AlertTriangle,
    Archive,
    BadgeDollarSign,
    Building2,
    CheckCircle2,
    Clock3,
    FileCheck2,
    FileText,
    FolderKanban,
    ReceiptText,
    ShieldCheck,
    UploadCloud,
    WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type DashboardKpi = {
    key: string;
    label: string;
    value: string;
    helper: string;
    tone: 'gold' | 'green' | 'red' | 'blue' | 'violet';
    icon: LucideIcon;
    href: string;
};

export type DashboardAction = {
    id: string;
    title: string;
    subtitle: string;
    due: string;
    tone: 'gold' | 'green' | 'red' | 'blue' | 'violet';
    icon: LucideIcon;
    href: string;
};

export type DashboardProject = {
    id: string;
    project: string;
    client: string;
    location: string;
    step: string;
    status: string;
    missingDocs: number;
    remaining: string;
    href: string;
};

export type DashboardAlert = {
    id: string;
    title: string;
    amount: string;
    subtitle: string;
    tone: 'red' | 'gold' | 'blue';
    href: string;
};

export type DashboardActivity = {
    id: string;
    title: string;
    description: string;
    time: string;
    tone: 'gold' | 'green' | 'blue' | 'neutral';
    icon: LucideIcon;
};

export const dashboardKpis: DashboardKpi[] = [
    {
        key: 'activeProjects',
        label: 'Active projects',
        value: '28',
        helper: '+12% this month',
        tone: 'blue',
        icon: FolderKanban,
        href: '/dossiers',
    },
    {
        key: 'missingDocs',
        label: 'Missing documents',
        value: '47',
        helper: '9 urgent today',
        tone: 'red',
        icon: FileCheck2,
        href: '/documents',
    },
    {
        key: 'pendingAuth',
        label: 'Pending authorizations',
        value: '16',
        helper: '3 need follow-up',
        tone: 'gold',
        icon: ShieldCheck,
        href: '/authorizations',
    },
    {
        key: 'unpaidInvoices',
        label: 'Unpaid invoices',
        value: '32',
        helper: '1,245,000 MAD',
        tone: 'violet',
        icon: ReceiptText,
        href: '/finance/documents?tab=invoices',
    },
    {
        key: 'todayPayments',
        label: 'Today payments',
        value: '210,000',
        helper: 'MAD collected',
        tone: 'green',
        icon: WalletCards,
        href: '/finance/documents?tab=monthly',
    },
];

export const nextActions: DashboardAction[] = [
    {
        id: 'upload-owner-id',
        title: 'Upload missing owner ID',
        subtitle: 'Villa construction study - Mohamed Ouknin',
        due: 'Today',
        tone: 'red',
        icon: UploadCloud,
        href: '/documents',
    },
    {
        id: 'generate-contract',
        title: 'Generate contract',
        subtitle: 'Apartment renovation - Salma El Mansouri',
        due: 'Today',
        tone: 'green',
        icon: FileText,
        href: '/contracts',
    },
    {
        id: 'authorization-followup',
        title: 'Follow authorization status',
        subtitle: 'DOS-2026-0002 - Commune Gueliz',
        due: 'Tomorrow',
        tone: 'gold',
        icon: ShieldCheck,
        href: '/authorizations',
    },
    {
        id: 'create-invoice',
        title: 'Create next invoice',
        subtitle: 'Villa construction study - 50% remaining',
        due: 'This week',
        tone: 'blue',
        icon: BadgeDollarSign,
        href: '/finance/documents',
    },
];

export const recentProjects: DashboardProject[] = [
    {
        id: 'DOS-2026-0001',
        project: 'Villa construction study',
        client: 'Mohamed Ouknin',
        location: 'Marrakech / Gueliz',
        step: 'Documents',
        status: 'In progress',
        missingDocs: 2,
        remaining: '12,000 MAD',
        href: '/dossiers/1',
    },
    {
        id: 'DOS-2026-0002',
        project: 'Apartment renovation',
        client: 'Salma El Mansouri',
        location: 'Marrakech / Gueliz',
        step: 'Contract',
        status: 'Active',
        missingDocs: 0,
        remaining: '8,500 MAD',
        href: '/dossiers/2',
    },
    {
        id: 'DOS-2026-0003',
        project: 'Villa',
        client: 'Anass Mohamed',
        location: 'Kelaa des Sraghna',
        step: 'Client',
        status: 'Opened',
        missingDocs: 4,
        remaining: '0 MAD',
        href: '/dossiers/3',
    },
];

export const financeAlerts: DashboardAlert[] = [
    {
        id: 'overdue-1',
        title: 'Overdue invoice',
        amount: '685,000 MAD',
        subtitle: '3 invoices overdue',
        tone: 'red',
        href: '/finance/documents?tab=invoices',
    },
    {
        id: 'pending-payment',
        title: 'Pending payment confirmation',
        amount: '75,000 MAD',
        subtitle: 'Receipt not generated',
        tone: 'gold',
        href: '/finance/documents?tab=payments',
    },
    {
        id: 'monthly',
        title: 'Monthly collected',
        amount: '210,000 MAD',
        subtitle: 'Open monthly summary',
        tone: 'blue',
        href: '/finance/documents?tab=monthly',
    },
];

export const activityFeed: DashboardActivity[] = [
    {
        id: 'a1',
        title: 'Document uploaded',
        description: 'Land title deed added to DOS-2026-0001',
        time: '10:24',
        tone: 'green',
        icon: FileCheck2,
    },
    {
        id: 'a2',
        title: 'Authorization updated',
        description: 'Commune observation marked as pending',
        time: '09:15',
        tone: 'gold',
        icon: ShieldCheck,
    },
    {
        id: 'a3',
        title: 'Payment recorded',
        description: 'Receipt REC-2026-0003 generated',
        time: 'Yesterday',
        tone: 'blue',
        icon: WalletCards,
    },
    {
        id: 'a4',
        title: 'Project archived',
        description: 'Archive number assigned to closed dossier',
        time: 'Yesterday',
        tone: 'neutral',
        icon: Archive,
    },
];

export const quickLinks = [
    { label: 'New project', href: '/dossiers', icon: FolderKanban },
    { label: 'Upload document', href: '/documents', icon: UploadCloud },
    { label: 'Create invoice', href: '/finance/documents', icon: ReceiptText },
    { label: 'Clients', href: '/clients', icon: Building2 },
];

export const systemHealth = [
    { label: 'Workflow QA', value: 'Passing', icon: CheckCircle2, tone: 'green' },
    { label: 'Finance lock', value: 'Protected', icon: ShieldCheck, tone: 'blue' },
    { label: 'Storage', value: 'Private', icon: FileCheck2, tone: 'gold' },
    { label: 'Alerts', value: '4 open', icon: AlertTriangle, tone: 'red' },
    { label: 'Last sync', value: 'Just now', icon: Clock3, tone: 'violet' },
];