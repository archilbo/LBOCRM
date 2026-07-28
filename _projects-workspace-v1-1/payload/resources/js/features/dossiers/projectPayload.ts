import type { DossierFormPayload } from '@/features/dossiers/types';

export type DossierRequestPayload = {
    client_id: string;
    city_id: string;
    project_object: string;
    description: string | null;
    project_address: string | null;
    province: string | null;
    commune: string | null;
    land_title_number: string | null;
    land_surface: string | null;
    floor_area: string | null;
    status: string;
    workflow_step: string;
    notes: string | null;
    return_to?: string;
};

function nullable(value: string): string | null {
    const normalized = value.trim();
    return normalized === '' ? null : normalized;
}

export function toDossierRequestPayload(
    payload: DossierFormPayload,
    returnTo?: string,
): DossierRequestPayload {
    return {
        client_id: payload.clientId,
        city_id: payload.cityId,
        project_object: payload.projectObject.trim(),
        description: nullable(payload.description),
        project_address: nullable(payload.projectAddress),
        province: nullable(payload.province),
        commune: nullable(payload.commune),
        land_title_number: nullable(payload.landTitleNumber),
        land_surface: nullable(payload.landSurface),
        floor_area: nullable(payload.floorArea),
        status: payload.status || 'opened',
        workflow_step: payload.workflowStep || 'client',
        notes: nullable(payload.notes),
        ...(returnTo ? { return_to: returnTo } : {}),
    };
}
