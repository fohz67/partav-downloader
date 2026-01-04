import { clearSources } from "./storage.js";
import { clearActiveDownloads } from "./download/persistence.js";

export async function purgeAll(): Promise<void> {
  await clearSources();
  await clearActiveDownloads();
}

