const STORAGE_KEY = "active_downloads";

export interface ActiveDownload {
  sourceId: string;
  progress: number;
  current: number;
  total: number;
  startedAt: number;
}

export async function saveActiveDownload(
  download: ActiveDownload,
): Promise<void> {
  const downloads = await getActiveDownloads();
  const index = downloads.findIndex((d) => d.sourceId === download.sourceId);

  if (index >= 0) {
    downloads[index] = download;
  } else {
    downloads.push(download);
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: downloads });
}

export async function getActiveDownloads(): Promise<ActiveDownload[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

export async function removeActiveDownload(sourceId: string): Promise<void> {
  const downloads = await getActiveDownloads();
  const filtered = downloads.filter((d) => d.sourceId !== sourceId);
  await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
}

export async function clearActiveDownloads(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY);
}
