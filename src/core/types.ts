export interface HLSSegment {
  url: string;
  timestamp: number;
  tabId: number;
}

export interface HLSSource {
  baseUrl: string;
  segments: HLSSegment[];
  detectedAt: number;
}

