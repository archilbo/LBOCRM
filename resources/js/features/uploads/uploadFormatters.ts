export function formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatSpeed(bytesPerSecond: number): string {
    if (bytesPerSecond <= 0) return '';
    return `${formatBytes(bytesPerSecond)}/s`;
}

export function formatEta(seconds: number): string {
    if (!seconds || seconds < 0 || !isFinite(seconds)) return '';
    if (seconds < 60) return `${Math.round(seconds)}s remaining`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s remaining`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m remaining`;
}

export function formatPercent(fraction: number): string {
    return `${Math.round(fraction * 100)}%`;
}
