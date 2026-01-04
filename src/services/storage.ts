import { HLSSource } from "../core/types.js";

const STORAGE_KEY = "hls_sources";

export async function getSources(): Promise<HLSSource[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

export async function saveSource(source: HLSSource): Promise<void> {
  const sources = await getSources();
  const existingIndex = sources.findIndex((s) => s.baseUrl === source.baseUrl);

  if (existingIndex >= 0) {
    sources[existingIndex] = source;
  } else {
    sources.push(source);
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: sources });
}

export async function clearSources(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY);
}

export async function removeSource(baseUrl: string): Promise<void> {
  const sources = await getSources();
  const filtered = sources.filter((s) => s.baseUrl !== baseUrl);
  await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
}
