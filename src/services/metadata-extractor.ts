export interface MovieMetadata {
  title: string;
  imageUrl: string | null;
  year: string | null;
}

export function extractMetadataFromPage(): MovieMetadata {
  const metadata: MovieMetadata = {
    title: 'Unknown',
    imageUrl: null,
    year: null,
  };

  const titleSelectors = [
    'b[style*="color:#818181"]',
    '.trend_title',
    'h1',
    'title',
  ];

  for (const selector of titleSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      let text = element.textContent?.trim() || '';
      text = text.replace(/\s*\((\d{4})\)\s*.*$/, ' ($1)');
      const yearMatch = text.match(/\((\d{4})\)/);
      if (yearMatch) {
        metadata.year = yearMatch[1];
        metadata.title = text.replace(/\s*\(\d{4}\).*$/, '').trim();
      } else {
        metadata.title = text;
      }
      if (metadata.title && metadata.title !== 'Unknown') {
        break;
      }
    }
  }

  const imgSelectors = [
    'img[src*="themoviedb"]',
    'img[src*="poster"]',
    'img[width="100%"]',
    'img',
  ];

  for (const selector of imgSelectors) {
    const img = document.querySelector(selector) as HTMLImageElement;
    if (img?.src && img.src.startsWith('http')) {
      metadata.imageUrl = img.src;
      break;
    }
  }

  return metadata;
}

export async function getMetadataFromActiveTab(): Promise<MovieMetadata> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: extractMetadataFromPage,
          },
          (results) => {
            if (results?.[0]?.result) {
              resolve(results[0].result);
            } else {
              resolve({ title: 'Unknown', imageUrl: null, year: null });
            }
          }
        );
      } else {
        resolve({ title: 'Unknown', imageUrl: null, year: null });
      }
    });
  });
}

