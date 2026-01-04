import { HLSSource } from '../core/types.js';
import { getFileNameFromUrl } from '../core/utils.js';
import { fetchAllSegments, FetchProgress } from './segment-fetcher.js';
import { combineBlobs, createBlobUrl, revokeBlobUrl } from './blob-combiner.js';

export async function downloadViaChromeAPI(
  source: HLSSource,
  onProgress?: (progress: FetchProgress) => void
): Promise<void> {
  if (source.segments.length === 0) {
    throw new Error('No segments to download');
  }

  const baseFileName = getFileNameFromUrl(source.baseUrl);
  const blobParts = await fetchAllSegments(source.segments, onProgress);

  if (blobParts.length === 0) {
    throw new Error('No segments downloaded successfully');
  }

  const combinedBlob = combineBlobs(blobParts);
  const blobUrl = createBlobUrl(combinedBlob);

  await chrome.downloads.download({
    url: blobUrl,
    filename: `${baseFileName}_complete.ts`,
    saveAs: true,
  });

  setTimeout(() => revokeBlobUrl(blobUrl), 1000);
}

