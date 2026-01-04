import { HLSSource } from '../../core/types.js';
import { FetchProgress } from '../segment/fetcher.js';
import { findSegmentRange } from '../segment/finder.js';
import { fetchSegmentRange } from '../segment/fetcher.js';
import { combineBlobs, createBlobUrl, revokeBlobUrl } from '../blob/combiner.js';
import { createProgressWrapper } from './progress.js';
import { getDownloadFileName } from './filename.js';

function notifyProgress(
  onProgress: (progress: FetchProgress) => void,
  progress: number,
  current: number,
  total: number
): void {
  onProgress({ progress, current, total });
}

async function findAndValidateRange(
  source: HLSSource,
  onProgress?: (progress: FetchProgress) => void
) {
  if (onProgress) {
    notifyProgress(onProgress, 0, 0, 0);
  }

  const detectedSegmentUrl = source.segments.length > 0 ? source.segments[0].url : undefined;
  if (!detectedSegmentUrl) {
    throw new Error('No segment URL found');
  }

  const range = await findSegmentRange(detectedSegmentUrl, detectedSegmentUrl);
  
  if (range.total === 0) {
    throw new Error('No segments found');
  }

  if (onProgress) {
    notifyProgress(onProgress, 5, 0, range.total);
  }

  return range;
}

async function downloadSegments(
  source: HLSSource,
  range: { start: number; end: number; total: number },
  onProgress?: (progress: FetchProgress) => void
): Promise<Blob[]> {
  const detectedSegmentUrl = source.segments.length > 0 ? source.segments[0].url : '';
  if (!detectedSegmentUrl) {
    throw new Error('No segment URL found');
  }

  const progressWrapper = createProgressWrapper(onProgress, 5, 0.95);
  const blobParts = await fetchSegmentRange(
    detectedSegmentUrl,
    range.start,
    range.end,
    progressWrapper
  );

  if (blobParts.length === 0) {
    throw new Error('No segments downloaded successfully');
  }

  if (onProgress) {
    notifyProgress(onProgress, 100, blobParts.length, blobParts.length);
  }

  return blobParts;
}

async function saveVideoFile(blobParts: Blob[], fileName: string): Promise<void> {
  const combinedBlob = combineBlobs(blobParts);
  const blobUrl = createBlobUrl(combinedBlob);

  await chrome.downloads.download({
    url: blobUrl,
    filename: `${fileName}.ts`,
    saveAs: true,
  });

  setTimeout(() => revokeBlobUrl(blobUrl), 1000);
}

export async function downloadCompleteVideo(
  source: HLSSource,
  onProgress?: (progress: FetchProgress) => void
): Promise<void> {
  const range = await findAndValidateRange(source, onProgress);
  const fileName = getDownloadFileName(source);
  const blobParts = await downloadSegments(source, range, onProgress);
  await saveVideoFile(blobParts, fileName);
}

