import { HLSSource } from "../core/types.js";
import { createProgressListener, updateProgressBar } from "./progress.js";
import { setDownloadingState, cleanupDownload } from "./ui-state.js";
import { removeActiveDownload } from "../services/download/persistence.js";

export function setupDownloadButton(
  source: HLSSource,
  downloadBtn: HTMLButtonElement,
  progressBar: HTMLElement,
  progressFill: HTMLElement,
  progressText: HTMLElement,
  activeDownloads: Set<string>,
): void {
  const sourceId = source.baseUrl;

  downloadBtn.addEventListener("click", () => {
    if (activeDownloads.has(sourceId)) {
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

  const errorListener = (message: any) => {
    if (message.type === "DOWNLOAD_ERROR" && message.sourceId === sourceId) {
      handleDownloadError(
        new Error(message.error),
        downloadBtn,
        progressBar,
        progressListener,
        sourceId,
        activeDownloads,
      );
      chrome.runtime.onMessage.removeListener(errorListener);
      chrome.runtime.onMessage.removeListener(progressListener);
    } else if (message.type === "DOWNLOAD_COMPLETE" && message.sourceId === sourceId) {
      handleDownloadSuccess(
        progressBar,
        downloadBtn,
        progressListener,
        sourceId,
        activeDownloads,
      );
      chrome.runtime.onMessage.removeListener(errorListener);
      chrome.runtime.onMessage.removeListener(progressListener);
    }
  };

  chrome.runtime.onMessage.addListener(errorListener);

  chrome.runtime.sendMessage(
    {
      type: "START_DOWNLOAD",
      source,
      sourceId,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        handleDownloadError(
          new Error(chrome.runtime.lastError.message),
          downloadBtn,
          progressBar,
          progressListener,
          sourceId,
          activeDownloads,
        );
        chrome.runtime.onMessage.removeListener(errorListener);
        chrome.runtime.onMessage.removeListener(progressListener);
      }
    }
  );
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
