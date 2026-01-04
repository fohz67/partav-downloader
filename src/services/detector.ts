import { HLSSegment, HLSSource } from '../core/types.js';
import { extractBaseUrl, extractSegmentNumber, extractFileName, isHLSSegment, normalizeUrl } from '../core/utils.js';
import { getSources, saveSource } from './storage.js';
import { getMetadataFromActiveTab } from './metadata-extractor.js';

function compareSegments(a: HLSSegment, b: HLSSegment): number {
  const numA = extractSegmentNumber(a.url);
  const numB = extractSegmentNumber(b.url);
  
  if (numA !== null && numB !== null) {
    return numA - numB;
  }
  
  const fileNameA = extractFileName(a.url) || '';
  const fileNameB = extractFileName(b.url) || '';
  
  if (fileNameA && fileNameB) {
    return fileNameA.localeCompare(fileNameB);
  }
  
  return a.timestamp - b.timestamp;
}

export async function detectHLSSegment(
  url: string,
  tabId: number
): Promise<HLSSource | null> {
  const normalizedUrl = normalizeUrl(url);
  
  if (!isHLSSegment(normalizedUrl)) {
    return null;
  }

  const baseUrl = extractBaseUrl(normalizedUrl);
  if (!baseUrl) {
    return null;
  }

  const segment: HLSSegment = {
    url: normalizedUrl,
    timestamp: Date.now(),
    tabId,
  };

  const existingSources = await getSources();
  const existingSource = existingSources.find(s => s.baseUrl === baseUrl);

  if (existingSource) {
    const existingSegment = existingSource.segments.find(
      s => s.url === normalizedUrl
    );
    
    if (!existingSegment) {
      existingSource.segments.push(segment);
      existingSource.segments.sort(compareSegments);
      await saveSource(existingSource);
    }
    return existingSource;
  }

  const metadata = await getMetadataFromActiveTab();
  
  const newSource: HLSSource = {
    baseUrl,
    segments: [segment],
    detectedAt: Date.now(),
    metadata,
  };

  await saveSource(newSource);
  return newSource;
}

