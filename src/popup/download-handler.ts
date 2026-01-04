import { HLSSource } from "../core/types.js";
import { FetchProgress } from "../services/segment/fetcher.js";
import { downloadCompleteVideo } from "../services/download/manager.js";
import { removeActiveDownload } from "../services/download/persistence.js";
import { isDownloadInProgress } from "../services/download/state.js";
import { createProgressListener, updateProgressBar } from "./progress.js";
import { setDownloadingState, cleanupDownload } from "./ui-state.js";

export function setupDownloadButton(
  source: HLSSource,
  downloadBtn: HTMLButtonElement,
  progressBar: HTMLElement,
  progressFill: HTMLElement,
  progressText: HTMLElement,
  activeDownloads: Set<string>,
): void {
  const sourceId = source.baseUrl;

  downloadBtn.addEventListener("click", async () => {
    if (activeDownloads.has(sourceId) || isDownloadInProgress()) {
      return;
    }

    startDownload(
      source,
      sourceId,
      downloadBtn,
      progressBar,
      progressFill,
      progressText,
      activeDownloads,
    );
  });
}

function startDownload(
  source: HLSSource,
  sourceId: string,
  downloadBtn: HTMLButtonElement,
  progressBar: HTMLElement,
  progressFill: HTMLElement,
  progressText: HTMLElement,
  activeDownloads: Set<string>,
): void {
  activeDownloads.add(sourceId);
  setDownloadingState(downloadBtn, progressBar, true);
  updateProgressBar(progressFill, progressText, 0, 0, 0);
  progressText.textContent = "Finding segments...";

  const progressListener = createProgressListener(progressFill, progressText);
  chrome.runtime.onMessage.addListener(progressListener);

  const onProgress = (progress: FetchProgress) => {
    chrome.runtime.sendMessage({
      type: "DOWNLOAD_PROGRESS",
      ...progress,
    });
  };

  executeDownload(
    source,
    sourceId,
    onProgress,
    progressListener,
    downloadBtn,
    progressBar,
    activeDownloads,
  );
}

async function executeDownload(
  source: HLSSource,
  sourceId: string,
  onProgress: (progress: FetchProgress) => void,
  progressListener: (message: any) => void,
  downloadBtn: HTMLButtonElement,
  progressBar: HTMLElement,
  activeDownloads: Set<string>,
): Promise<void> {
  try {
    await downloadCompleteVideo(source, onProgress, sourceId);
    handleDownloadSuccess(
      progressBar,
      downloadBtn,
      progressListener,
      sourceId,
      activeDownloads,
    );
  } catch (error) {
    handleDownloadError(
      error,
      downloadBtn,
      progressBar,
      progressListener,
      sourceId,
      activeDownloads,
    );
  }
}

function handleDownloadSuccess(
  progressBar: HTMLElement,
  downloadBtn: HTMLButtonElement,
  progressListener: (message: any) => void,
  sourceId: string,
  activeDownloads: Set<string>,
): void {
  setTimeout(() => {
    cleanupDownload(
      progressBar,
      downloadBtn,
      progressListener,
      sourceId,
      activeDownloads,
      removeActiveDownload,
    );
  }, 1000);
}

function handleDownloadError(
  error: unknown,
  downloadBtn: HTMLButtonElement,
  progressBar: HTMLElement,
  progressListener: (message: any) => void,
  sourceId: string,
  activeDownloads: Set<string>,
): void {
  console.error("Download error:", error);
  const message = error instanceof Error ? error.message : "Unknown error";
  alert(`Error during download: ${message}`);
  cleanupDownload(
    progressBar,
    downloadBtn,
    progressListener,
    sourceId,
    activeDownloads,
    removeActiveDownload,
  );
}
