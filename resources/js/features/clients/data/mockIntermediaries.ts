export type IntermediaryOption = {
    id: string;
    labelKey: string;
};

export const intermediaryOptions: IntermediaryOption[] = [
    {
        id: 'none',
        labelKey: 'clientFormExtra.none',
    },
    {
        id: 'agency',
        labelKey: 'clientFormExtra.agency',
    },
    {
        id: 'architectPartner',
        labelKey: 'clientFormExtra.architectPartner',
    },
    {
        id: 'businessReferral',
        labelKey: 'clientFormExtra.businessReferral',
    },
    {
        id: 'familyReferral',
        labelKey: 'clientFormExtra.familyReferral',
    },
];
