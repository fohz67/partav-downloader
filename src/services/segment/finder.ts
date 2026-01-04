import { extractFileName } from "../../core/utils.js";
import { parseSegmentUrl } from "../../core/url/parser.js";
import { findUpperBound, binarySearchLast } from "./binary-search.js";

export interface SegmentRange {
  start: number;
  end: number;
  total: number;
}

function getStartSegment(detectedSegmentUrl?: string): number {
  if (!detectedSegmentUrl) {
    return 1;
  }

  const parsed = parseSegmentUrl(detectedSegmentUrl);
  return parsed.segmentNumber ?? 1;
}

function validateParsedUrl(parsed: {
  basePath: string;
  baseFileName: string;
}): boolean {
  return !!(parsed.basePath && parsed.baseFileName);
}

export async function findLastSegment(
  baseUrl: string,
  detectedSegmentUrl?: string,
): Promise<number> {
  const fileName = extractFileName(baseUrl);
  if (!fileName) {
    return 0;
  }

  const parsed = parseSegmentUrl(baseUrl);
  if (!validateParsedUrl(parsed)) {
    return 0;
  }

  const startSegment = getStartSegment(detectedSegmentUrl);
  const high = await findUpperBound(
    parsed.basePath,
    parsed.baseFileName,
    startSegment,
  );
  return await binarySearchLast(parsed.basePath, parsed.baseFileName, high);
}

export async function findSegmentRange(
  baseUrl: string,
  detectedSegmentUrl?: string,
): Promise<SegmentRange> {
  const fileName = extractFileName(baseUrl);
  if (!fileName) {
    return { start: 1, end: 0, total: 0 };
  }

  const lastSegment = await findLastSegment(baseUrl, detectedSegmentUrl);

  if (lastSegment === 0) {
    return { start: 1, end: 0, total: 0 };
  }

  return {
    start: 1,
    end: lastSegment,
    total: lastSegment,
  };
}
