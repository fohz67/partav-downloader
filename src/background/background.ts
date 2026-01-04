import { detectHLSSegment } from "../services/detector.js";
import { getSources, clearSources } from "../services/storage.js";

chrome.webRequest.onBeforeRequest.addListener(
  (details: any) => {
    if (details.tabId && details.tabId > 0) {
      detectHLSSegment(details.url, details.tabId).catch(console.error);
    }
  },
  {
    urls: ["<all_urls>"],
  },
  [],
);

chrome.runtime.onMessage.addListener(
  (message: any, sender: any, sendResponse: any) => {
    if (message.type === "GET_SOURCES") {
      getSources().then((sources) => sendResponse(sources));
      return true;
    }

    if (message.type === "CLEAR_SOURCES") {
      clearSources().then(() => sendResponse({ success: true }));
      return true;
    }

    if (message.type === "DOWNLOAD_PROGRESS") {
      chrome.runtime.sendMessage(message);
    }
  },
);
