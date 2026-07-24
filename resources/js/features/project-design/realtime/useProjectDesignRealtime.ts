import { useCallback, useRef } from 'react';
import { useEcho } from '@laravel/echo-react';
import { useQueryClient } from '@tanstack/react-query';
import { projectDesignKeys } from '../api/projectDesignKeys';
import type { ProjectDesignAnnotation, ProjectDesignRemark } from '../types/projectDesign';

type ProjectDesignRealtimeEvent = {
    eventId: string;
    dossierId: number;
    action: string;
    entityType: string;
    entityId: number;
    fileId: number | null;
    versionId: number | null;
    annotationId: number | null;
    payload: Record<string, unknown> | null;
    actor: { id: number; name: string } | null;
    occurredAt: string;
};

type AnnotationResponse = { data: ProjectDesignAnnotation[] };

export function useProjectDesignRealtime(dossierId: number) {
    const queryClient = useQueryClient();
    const seenEventsRef = useRef<string[]>([]);

    const handleEvent = useCallback((event: ProjectDesignRealtimeEvent) => {
        if (event.dossierId !== dossierId || seenEventsRef.current.includes(event.eventId)) return;
        seenEventsRef.current = [...seenEventsRef.current.slice(-99), event.eventId];

        if (event.versionId && event.action.startsWith('annotation.') && event.payload) {
            const annotation = event.payload as unknown as ProjectDesignAnnotation;
            queryClient.setQueryData<AnnotationResponse>(
                projectDesignKeys.annotations(dossierId, event.versionId),
                (current) => {
                    if (!current) return current;
                    if (event.action === 'annotation.deleted') {
                        return { data: current.data.filter((item) => item.id !== event.entityId) };
                    }
                    const exists = current.data.some((item) => item.id === annotation.id);
                    return {
                        data: exists
                            ? current.data.map((item) => item.id === annotation.id ? annotation : item)
                            : [...current.data, annotation],
                    };
                },
            );
        }

        if (event.versionId && event.annotationId && event.action.startsWith('remark.')) {
            const remark = event.payload as unknown as ProjectDesignRemark | null;
            queryClient.setQueryData<AnnotationResponse>(
                projectDesignKeys.annotations(dossierId, event.versionId),
                (current) => current ? {
                    data: current.data.map((annotation) => annotation.id === event.annotationId
                        ? {
                            ...annotation,
                            remarkId: event.action === 'remark.deleted' ? null : remark?.id ?? annotation.remarkId,
                            remark: event.action === 'remark.deleted' ? null : remark,
                            hasRemark: event.action !== 'remark.deleted',
                        }
                        : annotation),
                } : current,
            );
        }

        void queryClient.invalidateQueries({
            queryKey: projectDesignKeys.all(dossierId),
            refetchType: 'active',
        });
    }, [dossierId, queryClient]);

    useEcho<ProjectDesignRealtimeEvent>(
        `project-design.dossier.${dossierId}`,
        'ProjectDesignChanged',
        handleEvent,
    );
}
