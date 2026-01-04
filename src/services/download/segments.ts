import { HLSSource } from "../../core/types.js";
import { FetchProgress } from "../segment/fetcher.js";
import { fetchSegmentRange } from "../segment/fetcher.js";
import { createProgressWrapper, notifyProgress } from "./progress-tracker.js";
import { getDetectedSegmentUrl } from "./url-extractor.js";

export async function downloadAllSegments(
  source: HLSSource,
  range: { start: number; end: number; total: number },
  onProgress?: (progress: FetchProgress) => void,
  sourceId?: string,
): Promise<Blob[]> {
  const detectedSegmentUrl = getDetectedSegmentUrl(source);

  const progressWrapper = createProgressWrapper(onProgress, 5, 0.95, sourceId);
  const blobParts = await fetchSegmentRange(
    detectedSegmentUrl,
    range.start,
    range.end,
    progressWrapper,
  );

  if (blobParts.length === 0) {
    throw new Error("No segments downloaded successfully");
  }

  if (onProgress) {
    notifyProgress(
      onProgress,
      100,
      blobParts.length,
      blobParts.length,
      sourceId,
    );
  }

  return blobParts;
}
