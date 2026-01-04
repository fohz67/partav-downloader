export function extractBaseFileName(fileName: string): string {
  const withoutExt = fileName.replace(/\.ts$/, "");
  const match = withoutExt.match(/^(.+?)(\d+)$/);
  return match ? match[1] : withoutExt;
}

export function parseSegmentUrl(url: string): {
  basePath: string;
  baseFileName: string;
  segmentNumber: number | null;
} {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const fileName = pathParts[pathParts.length - 1] || "";
    const basePath = urlObj.origin + pathParts.slice(0, -1).join("/") + "/";
    const baseFileName = extractBaseFileName(fileName);

    const numMatch = fileName.match(/(\d+)\.ts$/);
    const segmentNumber = numMatch ? parseInt(numMatch[1], 10) : null;

    return { basePath, baseFileName, segmentNumber };
  } catch {
    return { basePath: "", baseFileName: "", segmentNumber: null };
  }
}
