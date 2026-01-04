import { FetchProgress } from "../segment/fetcher.js";
import { saveActiveDownload } from "./persistence.js";

export function notifyProgress(
  onProgress: (progress: FetchProgress) => void,
  progress: number,
  current: number,
  total: number,
  sourceId?: string,
): void {
  onProgress({ progress, current, total });

  if (sourceId) {
    saveActiveDownload({
      sourceId,
      progress,
      current,
      total,
      startedAt: Date.now(),
    });
  }
}

export function createProgressWrapper(
  onProgress?: (progress: FetchProgress) => void,
  offset: number = 0,
  scale: number = 1,
  sourceId?: string,
): (progress: FetchProgress) => void {
  return (progress: FetchProgress) => {
    if (!onProgress) {
      return;
    }

    const adjustedProgress = offset + progress.progress * scale;
    const adjusted: FetchProgress = {
      progress: adjustedProgress,
      current: progress.current,
      total: progress.total,
    };

    notifyProgress(
      onProgress,
      adjustedProgress,
      progress.current,
      progress.total,
      sourceId,
    );
  };
}
