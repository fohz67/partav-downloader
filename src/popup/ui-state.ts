export function setDownloadingState(
  downloadBtn: HTMLButtonElement,
  progressBar: HTMLElement,
  isDownloading: boolean,
): void {
  downloadBtn.disabled = isDownloading;
  if (isDownloading) {
    progressBar.classList.add("active");
  } else {
    progressBar.classList.remove("active");
  }
}

export function cleanupDownload(
  progressBar: HTMLElement,
  downloadBtn: HTMLButtonElement,
  progressListener: (message: any) => void,
  sourceId: string,
  activeDownloads: Set<string>,
  removeActiveDownload: (id: string) => Promise<void>,
): void {
  setDownloadingState(downloadBtn, progressBar, false);
  chrome.runtime.onMessage.removeListener(progressListener);
  activeDownloads.delete(sourceId);
  removeActiveDownload(sourceId);
}
