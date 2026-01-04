import { HLSSource } from "../core/types.js";
import { FetchProgress } from "../services/segment/fetcher.js";
import { downloadCompleteVideo } from "../services/download/manager.js";
import { removeActiveDownload } from "../services/download/persistence.js";

let activeDownloadId: string | null = null;

export async function startDownload(
  source: HLSSource,
  sourceId: string,
  onProgressUpdate: (progress: FetchProgress) => void,
): Promise<void> {
  if (activeDownloadId === sourceId) {
    throw new Error("Download already in progress");
  }

  activeDownloadId = sourceId;

  try {
    const onProgress = (progress: FetchProgress) => {
      onProgressUpdate(progress);
      chrome.runtime.sendMessage({
        type: "DOWNLOAD_PROGRESS",
        sourceId,
        ...progress,
      });
    };

    await downloadCompleteVideo(source, onProgress, sourceId);
    await removeActiveDownload(sourceId);
    
    chrome.runtime.sendMessage({
      type: "DOWNLOAD_COMPLETE",
      sourceId,
    });
  } finally {
    if (activeDownloadId === sourceId) {
      activeDownloadId = null;
    }
  }
}

export function isDownloadActive(sourceId: string): boolean {
  return activeDownloadId === sourceId;
}

