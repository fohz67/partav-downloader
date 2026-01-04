import { buildSegmentUrl } from "../../core/url/builder.js";
import { checkSegmentExists } from "./checker.js";

export async function findUpperBound(
  basePath: string,
  baseFileName: string,
  startSegment: number,
): Promise<number> {
  let high = Math.max(startSegment * 2, 1000);
  let testUrl = buildSegmentUrl(basePath, baseFileName, high);
  let exists = await checkSegmentExists(testUrl);

  if (exists) {
    while (exists && high < 100000) {
      high *= 2;
      testUrl = buildSegmentUrl(basePath, baseFileName, high);
      exists = await checkSegmentExists(testUrl);
    }
  } else {
    high = Math.max(startSegment, 1000);
    while (!exists && high > 1) {
      high = Math.floor(high / 2);
      testUrl = buildSegmentUrl(basePath, baseFileName, high);
      exists = await checkSegmentExists(testUrl);
    }
  }

  return high;
}

export async function binarySearchLast(
  basePath: string,
  baseFileName: string,
  high: number,
): Promise<number> {
  let low = 1;
  let lastFound = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const testUrl = buildSegmentUrl(basePath, baseFileName, mid);
    const exists = await checkSegmentExists(testUrl);

    if (exists) {
      lastFound = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return lastFound;
}
