import { getSources } from "../services/storage.js";
import { getActiveDownloads } from "../services/download/persistence.js";
import { updateProgressBar } from "./progress.js";
import { setDownloadingState } from "./ui-state.js";
import { createProgressListener } from "./progress.js";

export async function restoreDownloadProgress(
  container: HTMLElement,
  activeDownloads: Set<string>,
): Promise<void> {
  const savedDownloads = await getActiveDownloads();

  for (const download of savedDownloads) {
    const sources = await getSources();
    const source = sources.find((s) => s.baseUrl === download.sourceId);

    if (!source) {
      continue;
    }

    const element = container.querySelector(
      `[data-source-id="${download.sourceId}"]`,
    ) as HTMLElement;
    if (!element) {
      continue;
    }

    restoreElementProgress(element, download, activeDownloads);
  }
}

function restoreElementProgress(
  element: HTMLElement,
  download: {
    progress: number;
    current: number;
    total: number;
    sourceId: string;
  },
  activeDownloads: Set<string>,
): void {
  const progressFill = element.querySelector(".progress-fill") as HTMLElement;
  const progressText = element.querySelector(".progress-text") as HTMLElement;
  const progressBar = element.querySelector(".progress-bar") as HTMLElement;
  const downloadBtn = element.querySelector(
    ".download-btn",
  ) as HTMLButtonElement;

  if (!progressFill || !progressText || !progressBar || !downloadBtn) {
    return;
  }

  const progress = Math.round(download.progress);
  updateProgressBar(
    progressFill,
    progressText,
    progress,
    download.current,
    download.total,
  );
  setDownloadingState(downloadBtn, progressBar, true);
  activeDownloads.add(download.sourceId);

  const progressListener = createProgressListener(progressFill, progressText);
  chrome.runtime.onMessage.addListener(progressListener);

  const completeListener = (message: any) => {
    if (message.type === "DOWNLOAD_COMPLETE" && message.sourceId === download.sourceId) {
      setDownloadingState(downloadBtn, progressBar, false);
      activeDownloads.delete(download.sourceId);
      chrome.runtime.onMessage.removeListener(completeListener);
      chrome.runtime.onMessage.removeListener(progressListener);
    } else if (message.type === "DOWNLOAD_ERROR" && message.sourceId === download.sourceId) {
      setDownloadingState(downloadBtn, progressBar, false);
      activeDownloads.delete(download.sourceId);
      chrome.runtime.onMessage.removeListener(completeListener);
      chrome.runtime.onMessage.removeListener(progressListener);
    }
  };

  chrome.runtime.onMessage.addListener(completeListener);
}
