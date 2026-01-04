import { HLSSource } from "../core/types.js";
import { formatUrl, formatDate, formatTitle } from "./formatters.js";

export function createSourceHTML(source: HLSSource): string {
  const sourceId = source.baseUrl;
  const segmentsCount = source.segments.length;
  const baseFileName = formatUrl(source.baseUrl);
  const title = formatTitle(source, baseFileName);
  const imageUrl = source.metadata?.imageUrl;
  const date = formatDate(source.detectedAt);

  return `
    ${imageUrl ? `<div class="source-image"><img src="${imageUrl}" alt="${title}" /></div>` : ""}
    <div class="source-header">
      <div class="source-title" title="${source.baseUrl}">${title}</div>
    </div>
    <div class="source-meta">
      ${segmentsCount} segment${segmentsCount > 1 ? "s" : ""} detected • ${date}
    </div>
    <div class="source-actions">
      <button class="btn-primary download-btn">Download All</button>
    </div>
    <div class="progress-bar">
      <div class="progress-fill"></div>
      <div class="progress-text">0%</div>
    </div>
  `;
}

export function createSourceElement(source: HLSSource): HTMLElement {
  const div = document.createElement("div");
  div.className = "source-item";
  div.setAttribute("data-source-id", source.baseUrl);
  div.innerHTML = createSourceHTML(source);
  return div;
}
