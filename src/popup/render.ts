import { HLSSource } from "../core/types.js";
import { createSourceElement } from "./element.js";
import { setupDownloadButton } from "./download-handler.js";

export function renderEmptyState(container: HTMLElement): void {
  container.innerHTML = `
    <div class="empty-state">
      <p>Monitoring active...</p>
      <p class="hint">Navigate to a page with an HLS video</p>
    </div>
  `;
}

export function renderSources(
  sources: HLSSource[],
  container: HTMLElement,
  activeDownloads: Set<string>,
): void {
  container.innerHTML = "";

  sources.forEach((source) => {
    const element = createSourceElement(source);
    const downloadBtn = element.querySelector(
      ".download-btn",
    ) as HTMLButtonElement;
    const progressBar = element.querySelector(".progress-bar") as HTMLElement;
    const progressFill = element.querySelector(".progress-fill") as HTMLElement;
    const progressText = element.querySelector(".progress-text") as HTMLElement;

    setupDownloadButton(
      source,
      downloadBtn,
      progressBar,
      progressFill,
      progressText,
      activeDownloads,
    );
    container.appendChild(element);
  });
}
