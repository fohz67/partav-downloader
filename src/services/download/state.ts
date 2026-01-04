let isDownloading = false;

export function setDownloading(value: boolean): void {
  isDownloading = value;
}

export function isDownloadInProgress(): boolean {
  return isDownloading;
}
