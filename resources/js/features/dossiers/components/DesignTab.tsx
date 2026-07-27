import { useCallback } from 'react';
import { Layers } from 'lucide-react';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { ProjectDesignTabContent } from '@/features/project-design/components/ProjectDesignTabContent';
import { parseWorkspaceState } from '@/features/project-design/hooks/useProjectDesignWorkspace';
import type { ProjectDesignFile } from '@/features/project-design/types/projectDesign';

function DesignTabContent({ dossierId, urlState, onNavigate }: {
    dossierId: number; urlState?: { mode: string; file: string; version: string; asset?: string; page?: string; remark: string; inspector?: string }; onNavigate?: (updates: { mode?: string; file?: string; version?: string; asset?: string; page?: string; remark?: string; inspector?: string }) => void;
}) {
    const workspaceState = parseWorkspaceState(urlState);

    const handleModeChange = useCallback((newMode: string) => {
        onNavigate?.({ mode: newMode });
    }, [onNavigate]);

    const handleFileSelect = useCallback((file: ProjectDesignFile) => {
        onNavigate?.({ file: String(file.id), mode: 'files' });
    }, [onNavigate]);

    return (
        <div className="flex min-h-0 flex-1 overflow-hidden">
            <ProjectDesignTabContent
                dossierId={dossierId}
                workspaceState={workspaceState}
                onModeChange={handleModeChange}
                onFileSelect={handleFileSelect}
                onNavigate={onNavigate}
            />
        </div>
    );
}

function DesignTab({ dossierId, canDesign, urlState, onNavigate }: {
    dossierId: number; canDesign?: boolean; urlState?: { mode: string; file: string; version: string; asset?: string; page?: string; remark: string; inspector?: string }; onNavigate?: (updates: { mode?: string; file?: string; version?: string; asset?: string; page?: string; remark?: string; inspector?: string }) => void;
}) {
    if (canDesign === false) {
        return <AppEmptyState icon={<Layers size={15} />} title="Access restricted" description="You do not have permission to view project designs." />;
    }

    return <DesignTabContent dossierId={dossierId} urlState={urlState} onNavigate={onNavigate} />;
}

export default DesignTab;
