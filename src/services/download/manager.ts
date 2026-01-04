import { HLSSource } from "../../core/types.js";
import { FetchProgress } from "../segment/fetcher.js";
import { getDownloadFileName } from "./filename.js";
import { setDownloading, isDownloadInProgress } from "./state.js";
import { removeActiveDownload } from "./persistence.js";
import { findAndValidateRange } from "./range.js";
import { downloadAllSegments } from "./segments.js";
import { saveVideoFile } from "./save.js";

export async function downloadCompleteVideo(
  source: HLSSource,
  onProgress?: (progress: FetchProgress) => void,
  sourceId?: string,
): Promise<void> {
  if (isDownloadInProgress()) {
    throw new Error("Download already in progress");
  }

  try {
    setDownloading(true);
    const range = await findAndValidateRange(source, onProgress, sourceId);
    const fileName = getDownloadFileName(source);
    const blobParts = await downloadAllSegments(
      source,
      range,
      onProgress,
      sourceId,
    );
    await saveVideoFile(blobParts, fileName);

    if (sourceId) {
      await removeActiveDownload(sourceId);
    }
  } finally {
    setDownloading(false);
  }
}
