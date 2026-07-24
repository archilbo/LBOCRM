import { createContext, useContext } from 'react';

export type ProjectDesignLayoutControls = {
    toggleBrowser: () => void;
    toggleInspector: () => void;
    openBrowser: () => void;
    openInspector: () => void;
    closeBrowser: () => void;
    closeInspector: () => void;
    browserAvailable: boolean;
    inspectorAvailable: boolean;
};

export const ProjectDesignLayoutContext = createContext<ProjectDesignLayoutControls>({
    toggleBrowser: () => {},
    toggleInspector: () => {},
    openBrowser: () => {},
    openInspector: () => {},
    closeBrowser: () => {},
    closeInspector: () => {},
    browserAvailable: false,
    inspectorAvailable: false,
});

export function useProjectDesignLayout() {
    return useContext(ProjectDesignLayoutContext);
}
