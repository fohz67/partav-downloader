import { HLSSource } from "../../core/types.js";
import { getFileNameFromUrl } from "../../core/utils.js";

export function getDownloadFileName(source: HLSSource): string {
  if (source.metadata?.title) {
    const year = source.metadata.year ? ` (${source.metadata.year})` : "";
    return `${source.metadata.title}${year}`;
  }

  return getFileNameFromUrl(source.baseUrl);
}
