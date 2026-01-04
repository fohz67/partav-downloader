import { HLSSegment } from "../../core/types.js";
import { parseSegmentUrl } from "../../core/url/parser.js";
import { buildSegmentUrl } from "../../core/url/builder.js";

export interface FetchProgress {
  progress: number;
  current: number;
  total: number;
}

function calculateProgress(index: number, total: number): FetchProgress {
  return {
    progress: ((index + 1) / total) * 100,
    current: index + 1,
    total,
  };
}

export async function fetchSegment(
  segment: HLSSegment,
  index: number,
  total: number,
  onProgress?: (progress: FetchProgress) => void,
): Promise<Blob | null> {
  try {
    const response = await fetch(segment.url);

    if (!response.ok) {
      console.warn(`Segment ${index + 1} not available: ${segment.url}`);
      return null;
    }

    const blob = await response.blob();

    if (onProgress) {
      onProgress(calculateProgress(index, total));
    }

    return blob;
  } catch (error) {
    console.error(`Error downloading segment ${index + 1}:`, error);
    return null;
  }
}

export async function fetchAllSegments(
  segments: HLSSegment[],
  onProgress?: (progress: FetchProgress) => void,
): Promise<Blob[]> {
  const blobParts: Blob[] = [];

  for (let i = 0; i < segments.length; i++) {
    const blob = await fetchSegment(
      segments[i],
      i,
      segments.length,
      onProgress,
    );
    if (blob) {
      blobParts.push(blob);
    }
  }

  return blobParts;
}

export async function fetchSegmentRange(
  baseUrl: string,
  start: number,
  end: number,
  onProgress?: (progress: FetchProgress) => void,
): Promise<Blob[]> {
  const blobParts: Blob[] = [];
  const total = end - start + 1;

  const parsed = parseSegmentUrl(baseUrl);
  if (!parsed.basePath || !parsed.baseFileName) {
    return blobParts;
  }

  for (let i = start; i <= end; i++) {
    const segmentUrl = buildSegmentUrl(parsed.basePath, parsed.baseFileName, i);
    const segment: HLSSegment = {
      url: segmentUrl,
      timestamp: Date.now(),
      tabId: 0,
    };

    const blob = await fetchSegment(segment, i - start, total, onProgress);
    if (blob) {
      blobParts.push(blob);
    } else {
      break;
    }
  }

  return blobParts;
}
