import { useContext } from 'react';
import { GlobalUploadContext, type GlobalUploadContextValue } from './GlobalUploadProvider';

export function useGlobalUploads(): GlobalUploadContextValue {
    const ctx = useContext(GlobalUploadContext);
    if (!ctx) {
        throw new Error('useGlobalUploads must be used within GlobalUploadProvider');
    }
    return ctx;
}
