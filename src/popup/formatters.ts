export function formatUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    return url;
  }
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US");
}

export function formatTitle(
  source: { metadata?: { title?: string; year?: string | null } },
  baseFileName: string,
): string {
  if (!source.metadata?.title) {
    return baseFileName;
  }

  const year = source.metadata.year ? ` (${source.metadata.year})` : "";
  return `${source.metadata.title}${year}`;
}
