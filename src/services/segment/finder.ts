import { extractFileName } from '../../core/utils.js';
import { parseSegmentUrl } from '../../core/url/parser.js';
import { buildSegmentUrl } from '../../core/url/builder.js';
import { checkSegmentExists } from './checker.js';

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

function findUpperBound(
  basePath: string,
  baseFileName: string,
  startSegment: number
): Promise<number> {
  return new Promise(async (resolve) => {
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
    
    resolve(high);
  });
}

function binarySearchLastSegment(
  basePath: string,
  baseFileName: string,
  high: number
): Promise<number> {
  return new Promise(async (resolve) => {
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

    resolve(lastFound);
  });
}

export async function findLastSegment(
  baseUrl: string,
  detectedSegmentUrl?: string
): Promise<number> {
  const fileName = extractFileName(baseUrl);
  if (!fileName) {
    return 0;
  }

  const parsed = parseSegmentUrl(baseUrl);
  if (!parsed.basePath || !parsed.baseFileName) {
    return 0;
  }

  const startSegment = getStartSegment(detectedSegmentUrl);
  const high = await findUpperBound(parsed.basePath, parsed.baseFileName, startSegment);
  return await binarySearchLastSegment(parsed.basePath, parsed.baseFileName, high);
}

export async function findSegmentRange(
  baseUrl: string,
  detectedSegmentUrl?: string
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

