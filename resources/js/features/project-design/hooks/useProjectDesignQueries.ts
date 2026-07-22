import { useQuery } from '@tanstack/react-query';
import { projectDesignApi } from '../api/projectDesignApi';
import { projectDesignKeys } from '../api/projectDesignKeys';
import type {
    ProjectDesignSummary, ProjectDesignFolder, ProjectDesignFile,
    ProjectDesignReview, ProjectDesignRemark, ProjectDesignActivity, ProjectDesignVersion,
} from '../types/projectDesign';

export function useSummary(dossierId: number) {
    return useQuery<ProjectDesignSummary>({
        queryKey: projectDesignKeys.summary(dossierId),
        queryFn: ({ signal }) => projectDesignApi.getSummary(dossierId, signal),
        staleTime: 30_000,
    });
}

export function useFolders(dossierId: number) {
    return useQuery<ProjectDesignFolder[]>({
        queryKey: projectDesignKeys.folders(dossierId),
        queryFn: ({ signal }) => projectDesignApi.getFolders(dossierId, signal),
        staleTime: 60_000,
    });
}

export function useFiles(dossierId: number, params: Record<string, string | number | undefined>) {
    return useQuery({
        queryKey: projectDesignKeys.files(dossierId, params),
        queryFn: ({ signal }) => projectDesignApi.getFiles(dossierId, params, signal),
        staleTime: 15_000,
        placeholderData: (prev) => prev,
    });
}

export function useFileDetail(dossierId: number, fileId: number | null) {
    return useQuery<ProjectDesignFile>({
        queryKey: projectDesignKeys.file(dossierId, fileId ?? 0),
        queryFn: ({ signal }) => projectDesignApi.getFile(dossierId, fileId!, signal),
        enabled: !!fileId,
        staleTime: 30_000,
    });
}

export function useReviews(dossierId: number) {
    return useQuery<{ data: ProjectDesignReview[] }>({
        queryKey: projectDesignKeys.reviews(dossierId),
        queryFn: ({ signal }) => projectDesignApi.getReviews(dossierId, signal),
        staleTime: 15_000,
    });
}

export function useRemarks(dossierId: number, params: Record<string, string | undefined>) {
    return useQuery<{ data: ProjectDesignRemark[]; meta: { total: number; page: number; lastPage: number } }>({
        queryKey: projectDesignKeys.remarks(dossierId, params),
        queryFn: ({ signal }) => projectDesignApi.getRemarks(dossierId, params, signal),
        staleTime: 15_000,
        placeholderData: (prev) => prev,
    });
}

export function useVersions(dossierId: number, fileId: number | null) {
    return useQuery<{ data: ProjectDesignVersion[] }>({
        queryKey: projectDesignKeys.versions(dossierId, fileId ?? 0),
        queryFn: ({ signal }) => projectDesignApi.getVersions(dossierId, fileId!, signal),
        enabled: !!fileId,
        staleTime: 30_000,
    });
}

export function useActivity(dossierId: number) {
    return useQuery<{ data: ProjectDesignActivity[] }>({
        queryKey: projectDesignKeys.activity(dossierId),
        queryFn: ({ signal }) => projectDesignApi.getActivity(dossierId, signal),
        staleTime: 30_000,
    });
}
