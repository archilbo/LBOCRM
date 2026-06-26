export type ClientStatus = 'active' | 'inactive' | 'archived';

export type ClientRow = {
    id: number;
    clientNumber: string;
    civility: 'Mr' | 'Mrs' | 'Company';
    firstName: string;
    lastName: string;
    fullName: string;
    cin: string;
    phone: string;
    email: string;
    address: string;
    fatherName: string;
    motherName: string;
    cniExpirationDate: string;
    intermediaryId: string;
    intermediaryName: string;
    status: ClientStatus;
    projectsCount: number;
    updatedAt: string;
    notes: string;
};

export const clientRows: ClientRow[] = [
    {
        id: 1,
        clientNumber: 'CL-2026-0001',
        civility: 'Mr',
        firstName: 'Mohamed',
        lastName: 'Ouknin',
        fullName: 'Mohamed Ouknin',
        cin: 'EE123456',
        phone: '+212 6 11 22 33 44',
        email: 'mohamed.ouknin@email.com',
        address: 'Marrakech, Morocco',
        fatherName: 'Ahmed Ouknin',
        motherName: 'Fatima Ouknin',
        cniExpirationDate: '2030-05-12',
        intermediaryId: 'none',
        intermediaryName: 'None',
        status: 'active',
        projectsCount: 2,
        updatedAt: 'Today',
        notes: 'Client interested in villa construction project.',
    },
    {
        id: 2,
        clientNumber: 'CL-2026-0002',
        civility: 'Mrs',
        firstName: 'Salma',
        lastName: 'El Mansouri',
        fullName: 'Salma El Mansouri',
        cin: 'BK884210',
        phone: '+212 6 55 20 10 88',
        email: 'salma@email.com',
        address: 'Gueliz, Marrakech',
        fatherName: 'Mustapha El Mansouri',
        motherName: 'Amina El Mansouri',
        cniExpirationDate: '2029-01-20',
        intermediaryId: 'agency',
        intermediaryName: 'Agency',
        status: 'active',
        projectsCount: 1,
        updatedAt: 'Yesterday',
        notes: 'Renovation project. Waiting for additional property documents.',
    },
    {
        id: 3,
        clientNumber: 'CL-2026-0003',
        civility: 'Mr',
        firstName: 'Anas',
        lastName: 'Berrada',
        fullName: 'Anas Berrada',
        cin: 'HH458799',
        phone: '+212 6 70 88 44 12',
        email: 'anas@email.com',
        address: 'Sidi Youssef Ben Ali',
        fatherName: 'Karim Berrada',
        motherName: 'Nadia Berrada',
        cniExpirationDate: '2031-09-08',
        intermediaryId: 'none',
        intermediaryName: 'None',
        status: 'inactive',
        projectsCount: 1,
        updatedAt: '2 days ago',
        notes: 'Commercial facade update.',
    },
    {
        id: 4,
        clientNumber: 'CL-2026-0004',
        civility: 'Mrs',
        firstName: 'Nadia',
        lastName: 'Amrani',
        fullName: 'Nadia Amrani',
        cin: 'MA778845',
        phone: '+212 6 33 44 55 66',
        email: 'nadia@email.com',
        address: 'Medina, Marrakech',
        fatherName: 'Hassan Amrani',
        motherName: 'Zahra Amrani',
        cniExpirationDate: '2028-11-17',
        intermediaryId: 'familyReferral',
        intermediaryName: 'Family referral',
        status: 'active',
        projectsCount: 1,
        updatedAt: '4 days ago',
        notes: 'Riad restoration project.',
    },
    {
        id: 5,
        clientNumber: 'CL-2026-0005',
        civility: 'Company',
        firstName: 'ARCHI',
        lastName: 'Invest',
        fullName: 'ARCHI Invest SARL',
        cin: 'ICE998812',
        phone: '+212 5 24 00 00 00',
        email: 'contact@archiinvest.ma',
        address: 'Targa, Marrakech',
        fatherName: '',
        motherName: '',
        cniExpirationDate: '',
        intermediaryId: 'businessReferral',
        intermediaryName: 'Business referral',
        status: 'archived',
        projectsCount: 3,
        updatedAt: '1 week ago',
        notes: 'Company client. Archived for prototype.',
    },
];

export function findClientById(id: number) {
    return clientRows.find((client) => client.id === id) ?? clientRows[0];
}
