import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectDesignApi } from '../api/projectDesignApi';
import { projectDesignKeys } from '../api/projectDesignKeys';
import { toast } from 'sonner';

export function useCreateFolder(dossierId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (name: string) => projectDesignApi.createFolder(dossierId, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectDesignKeys.folders(dossierId) });
            queryClient.invalidateQueries({ queryKey: projectDesignKeys.summary(dossierId) });
            toast.success('Folder created.');
        },
        onError: () => toast.error('Could not create folder.'),
    });
}

export function useArchiveFile(dossierId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ fileId, isRestore }: { fileId: number; isRestore: boolean }) =>
            isRestore ? projectDesignApi.restoreFile(dossierId, fileId) : projectDesignApi.archiveFile(dossierId, fileId),
        onSuccess: (_data, variables) => {
            toast.success(variables.isRestore ? 'File restored.' : 'File archived.');
            queryClient.invalidateQueries({ queryKey: projectDesignKeys.files(dossierId) });
            queryClient.invalidateQueries({ queryKey: projectDesignKeys.summary(dossierId) });
        },
        onError: () => toast.error('Could not update file.'),
    });
}

export function useStartReview(dossierId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ versionId, reviewId }: { versionId: number; reviewId: number }) =>
            projectDesignApi.startReview(dossierId, versionId, reviewId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectDesignKeys.reviews(dossierId) });
            toast.success('Review started.');
        },
        onError: () => toast.error('Could not start review.'),
    });
}

export function useDecideReview(dossierId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ versionId, reviewId, decision, note }: { versionId: number; reviewId: number; decision: string; note?: string }) =>
            projectDesignApi.decideReview(dossierId, versionId, reviewId, decision, note),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: projectDesignKeys.reviews(dossierId) });
            toast.success(`Review ${variables.decision}.`);
        },
        onError: () => toast.error('Could not submit decision.'),
    });
}
