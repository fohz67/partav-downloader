export function combineBlobs(blobs: Blob[], mimeType: string = 'video/mp2t'): Blob {
  return new Blob(blobs, { type: mimeType });
}

export function createBlobUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeBlobUrl(url: string): void {
  URL.revokeObjectURL(url);
}

