export function extractBaseUrl(url: string): string | null {
  const match = url.match(/^(.+?\/)([^\/]+\.ts)$/);
  return match ? match[1] : null;
}

export function extractSegmentNumber(url: string): number | null {
  const match = url.match(/(\d+)\.ts$/);
  return match ? parseInt(match[1], 10) : null;
}

export function extractFileName(url: string): string | null {
  const match = url.match(/\/([^\/]+\.ts)$/);
  return match ? match[1] : null;
}

export function isHLSSegment(url: string): boolean {
  return url.endsWith(".ts") && url.includes("/");
}

export function normalizeUrl(url: string): string {
  try {
    return new URL(url).href;
  } catch {
    return url;
  }
}

export function getFileNameFromUrl(url: string): string {
  const urlObj = new URL(url);
  const fileName = urlObj.pathname.split("/").pop() || "video";
  return fileName.replace(/\.ts$/, "");
}
