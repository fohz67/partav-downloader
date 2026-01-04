import { detectHLSSegment } from "../services/detector.js";
import { startDownload } from "./download-handler.js";
import { getSources } from "../services/storage.js";
import { HLSSource } from "../core/types.js";
import { FetchProgress } from "../services/segment/fetcher.js";

chrome.webRequest.onBeforeRequest.addListener(
  (details: any) => {
    if (details.url.endsWith(".ts")) {
      detectHLSSegment(details.url, details.tabId).then((source) => {
        if (source) {
          chrome.runtime.sendMessage({
            type: "NEW_SOURCE_DETECTED",
            source,
          });
        }
      });
    }
  },
  { urls: ["<all_urls>"] },
  []
);

chrome.runtime.onMessage.addListener(
  (message: any, sender: any, sendResponse: any) => {
    if (message.type === "START_DOWNLOAD") {
      const source: HLSSource = message.source;
      const sourceId = message.sourceId;

      startDownload(source, sourceId, (progress: FetchProgress) => {
        chrome.runtime.sendMessage({
          type: "DOWNLOAD_PROGRESS",
          sourceId,
          ...progress,
        });
      }).catch((error) => {
        chrome.runtime.sendMessage({
          type: "DOWNLOAD_ERROR",
          sourceId,
          error: error.message,
        });
      });

      sendResponse({ success: true });
      return true;
    }
  }
);
