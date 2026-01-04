import { HLSSource } from "../../core/types.js";

export function getDetectedSegmentUrl(source: HLSSource): string {
  if (source.segments.length === 0) {
    throw new Error("No segment URL found");
  }

  return source.segments[0].url;
}
