import { FetchProgress } from "../services/segment/fetcher.js";

export function updateProgressBar(
  progressFill: HTMLElement,
  progressText: HTMLElement,
  progress: number,
  current: number,
  total: number,
): void {
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `${progress}% (${current}/${total})`;
}

export function createProgressListener(
  progressFill: HTMLElement,
  progressText: HTMLElement,
): (message: any) => void {
  return (message: any) => {
    if (message.type === "DOWNLOAD_PROGRESS") {
      const progress = Math.round(message.progress);
      updateProgressBar(
        progressFill,
        progressText,
        progress,
        message.current,
        message.total,
      );
    }
  };
}
