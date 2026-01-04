import { getSources } from "../services/storage.js";
import { renderEmptyState, renderSources } from "./render.js";
import { restoreDownloadProgress } from "./restore.js";
import { purgeAll } from "../services/purge.js";

const sourcesListEl = document.getElementById("sourcesList")!;
const clearBtn = document.getElementById("clearBtn")!;
const activeDownloads = new Set<string>();
let isRendering = false;

function loadSources(): Promise<void> {
  if (isRendering || activeDownloads.size > 0) {
    return Promise.resolve();
  }

  isRendering = true;
  return getSources()
    .then((sources) => {
      if (sources.length === 0) {
        renderEmptyState(sourcesListEl);
        return;
      }

      renderSources(sources, sourcesListEl, activeDownloads);
      return restoreDownloadProgress(sourcesListEl, activeDownloads);
    })
    .finally(() => {
      isRendering = false;
    });
}

function setupClearButton(): void {
  clearBtn.addEventListener("click", async () => {
    if (confirm("Purge all sources and active downloads?")) {
      activeDownloads.clear();
      await purgeAll();
      chrome.runtime.sendMessage({ type: "PURGE_ALL" });
      await loadSources();
    }
  });
}

function setupMessageListener(): void {
  chrome.runtime.onMessage.addListener((message: any) => {
    if (message.type === "NEW_SOURCE_DETECTED" && !isRendering && activeDownloads.size === 0) {
      loadSources();
    }
  });
}

function init(): void {
  setupClearButton();
  setupMessageListener();
  loadSources();
}

init();
