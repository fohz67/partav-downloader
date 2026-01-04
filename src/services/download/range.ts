import { HLSSource } from "../../core/types.js";
import { FetchProgress } from "../segment/fetcher.js";
import { findSegmentRange } from "../segment/finder.js";
import { notifyProgress } from "./progress-tracker.js";
import { getDetectedSegmentUrl } from "./url-extractor.js";

export async function findAndValidateRange(
  source: HLSSource,
  onProgress?: (progress: FetchProgress) => void,
  sourceId?: string,
): Promise<{ start: number; end: number; total: number }> {
  if (onProgress) {
    notifyProgress(onProgress, 0, 0, 0, sourceId);
  }

  const detectedSegmentUrl = getDetectedSegmentUrl(source);

  const range = await findSegmentRange(detectedSegmentUrl, detectedSegmentUrl);

  if (range.total === 0) {
    throw new Error("No segments found");
  }

  if (onProgress) {
    notifyProgress(onProgress, 5, 0, range.total, sourceId);
  }

  return range;
}
