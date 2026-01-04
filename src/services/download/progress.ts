import { FetchProgress } from '../segment/fetcher.js';

export function createProgressWrapper(
  onProgress?: (progress: FetchProgress) => void,
  offset: number = 0,
  scale: number = 1
): (progress: FetchProgress) => void {
  return (progress: FetchProgress) => {
    if (onProgress) {
      const adjustedProgress = offset + (progress.progress * scale);
      onProgress({
        progress: adjustedProgress,
        current: progress.current,
        total: progress.total,
      });
    }
  };
}

