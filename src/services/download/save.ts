import {
  combineBlobs,
  createBlobUrl,
  revokeBlobUrl,
} from "../blob/combiner.js";

export async function saveVideoFile(
  blobParts: Blob[],
  fileName: string,
): Promise<void> {
  const combinedBlob = combineBlobs(blobParts);
  const blobUrl = createBlobUrl(combinedBlob);

  await chrome.downloads.download({
    url: blobUrl,
    filename: `${fileName}.ts`,
    saveAs: true,
  });

  setTimeout(() => revokeBlobUrl(blobUrl), 1000);
}
