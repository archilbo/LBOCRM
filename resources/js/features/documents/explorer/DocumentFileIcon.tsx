import { createElement } from 'react';
import type { LucideIcon } from 'lucide-react';

import { resolveFileIcon } from './documentExplorerFormatters';
import type { DocumentPreviewKind } from './documentExplorerTypes';

type DocumentFileIconProps = {
    kind: DocumentPreviewKind;
    extension?: string | null;
    size?: number;
    strokeWidth?: number;
    className?: string;
};

/**
 * File-type icon by preview kind and normalized extension. The mapping itself
 * is pure (documentExplorerFormatters.resolveFileIcon); this component only
 * renders it with aria-hidden since the icon is always decorative.
 */
export function DocumentFileIcon({
    kind,
    extension,
    size = 16,
    strokeWidth = 1.75,
    className,
}: DocumentFileIconProps) {
    const Icon: LucideIcon = resolveFileIcon(kind, extension ?? null);

    // createElement instead of JSX so the resolved icon is not treated as a
    // component created during render (react-hooks/static-components).
    return createElement(Icon, { 'aria-hidden': true, size, strokeWidth, className });
}
