const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

export function isPdfAsset(asset: { mimeType: string }): boolean {
  return asset.mimeType === 'application/pdf';
}

export function isImageAsset(asset: { mimeType: string }): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(asset.mimeType);
}

export function isPreviewableAsset(asset: { mimeType: string; previewable: boolean }): boolean {
  return asset.previewable && (isPdfAsset(asset) || isImageAsset(asset));
}

export function getAssetDisplayName(asset: { originalFilename: string }): string {
  return asset.originalFilename;
}

export function getAssetExtension(asset: { originalFilename: string; extension?: string }): string {
  return asset.extension ?? asset.originalFilename.split('.').pop() ?? '';
}

export function formatVersionLabel(version: { versionNumber: number; revisionCode?: string | null }): string {
  let label = `v${version.versionNumber}`;
  if (version.revisionCode) {
    label += ` - ${version.revisionCode}`;
  }
  return label;
}
