import { HLSSegment } from '../core/types.js';

export interface FetchProgress {
  progress: number;
  current: number;
  total: number;
}

export async function fetchSegment(
  segment: HLSSegment,
  index: number,
  total: number,
  onProgress?: (progress: FetchProgress) => void
): Promise<Blob | null> {
  try {
    const response = await fetch(segment.url);
    
    if (!response.ok) {
      console.warn(`Segment ${index + 1} not available: ${segment.url}`);
      return null;
    }
    
    const blob = await response.blob();
    
    if (onProgress) {
      onProgress({
        progress: ((index + 1) / total) * 100,
        current: index + 1,
        total,
      });
    }
    
    return blob;
  } catch (error) {
    console.error(`Error downloading segment ${index + 1}:`, error);
    return null;
  }
}

export async function fetchAllSegments(
  segments: HLSSegment[],
  onProgress?: (progress: FetchProgress) => void
): Promise<Blob[]> {
  const blobParts: Blob[] = [];

  for (let i = 0; i < segments.length; i++) {
    const blob = await fetchSegment(segments[i], i, segments.length, onProgress);
    if (blob) {
      blobParts.push(blob);
    }
  }

  return blobParts;
}

