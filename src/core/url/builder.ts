export function buildSegmentUrl(basePath: string, baseFileName: string, segmentNumber: number): string {
  return `${basePath}${baseFileName}${segmentNumber}.ts`;
}

