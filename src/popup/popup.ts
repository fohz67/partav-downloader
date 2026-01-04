import { getSources, clearSources } from "../services/storage.js";
import { isDownloadInProgress } from "../services/download/state.js";
import { renderEmptyState, renderSources } from "./render.js";
import { restoreDownloadProgress } from "./restore.js";

const sourcesListEl = document.getElementById("sourcesList")!;
const clearBtn = document.getElementById("clearBtn")!;
const activeDownloads = new Set<string>();

function loadSources(): Promise<void> {
  return getSources().then((sources) => {
    if (sources.length === 0) {
      renderEmptyState(sourcesListEl);
      return;
    }

    renderSources(sources, sourcesListEl, activeDownloads);
    return restoreDownloadProgress(sourcesListEl, activeDownloads);
  });
}

function setupClearButton(): void {
  clearBtn.addEventListener("click", async () => {
    if (confirm("Clear all detected sources?")) {
      await clearSources();
      await loadSources();
    }
  });
}

function setupMessageListener(): void {
  let isLoading = false;

  chrome.runtime.onMessage.addListener((message: any) => {
    if (
      message.type === "NEW_SOURCE_DETECTED" &&
      !isLoading &&
      !isDownloadInProgress()
    ) {
      loadSources();
    }
  });
}

function startAutoRefresh(): void {
  let isLoading = false;

  setInterval(() => {
    if (isLoading || isDownloadInProgress()) {
      return;
    }

    isLoading = true;
    loadSources().finally(() => {
      isLoading = false;
    });
  }, 2000);
}

function init(): void {
  setupClearButton();
  setupMessageListener();
  loadSources();
  startAutoRefresh();
}

init();
