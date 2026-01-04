import { HLSSource } from '../core/types.js';
import { downloadViaChromeAPI } from '../services/download-manager.js';
import { getSources, clearSources } from '../services/storage.js';
import { FetchProgress } from '../services/segment-fetcher.js';

const sourcesListEl = document.getElementById('sourcesList')!;
const clearBtn = document.getElementById('clearBtn')!;

function formatUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    return url;
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US');
}

function createSourceElement(source: HLSSource): HTMLElement {
  const div = document.createElement('div');
  div.className = 'source-item';
  
  const segmentsCount = source.segments.length;
  const baseFileName = formatUrl(source.baseUrl);
  
  div.innerHTML = `
    <div class="source-header">
      <div class="source-url" title="${source.baseUrl}">${baseFileName}</div>
    </div>
    <div class="source-meta">
      ${segmentsCount} segment${segmentsCount > 1 ? 's' : ''} detected • ${formatDate(source.detectedAt)}
    </div>
    <div class="source-actions">
      <button class="btn-primary download-btn" data-base-url="${source.baseUrl}">
        Download
      </button>
    </div>
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
  `;
  
  const downloadBtn = div.querySelector('.download-btn') as HTMLButtonElement;
  const progressBar = div.querySelector('.progress-bar') as HTMLElement;
  const progressFill = div.querySelector('.progress-fill') as HTMLElement;
  
  const progressListener = (message: any) => {
    if (message.type === 'DOWNLOAD_PROGRESS') {
      progressFill.style.width = `${message.progress}%`;
    }
  };

  downloadBtn.addEventListener('click', async () => {
    downloadBtn.disabled = true;
    progressBar.classList.add('active');
    progressFill.style.width = '0%';
    
    chrome.runtime.onMessage.addListener(progressListener);
    
    const onProgress = (progress: FetchProgress) => {
      chrome.runtime.sendMessage({
        type: 'DOWNLOAD_PROGRESS',
        ...progress,
      });
    };
    
    try {
      await downloadViaChromeAPI(source, onProgress);
      
      setTimeout(() => {
        progressBar.classList.remove('active');
        downloadBtn.disabled = false;
        chrome.runtime.onMessage.removeListener(progressListener);
      }, 1000);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error during download');
      downloadBtn.disabled = false;
      progressBar.classList.remove('active');
      chrome.runtime.onMessage.removeListener(progressListener);
    }
  });
  
  return div;
}

function renderSources(sources: HLSSource[]): void {
  if (sources.length === 0) {
    sourcesListEl.innerHTML = `
      <div class="empty-state">
        <p>Monitoring active...</p>
        <p class="hint">Navigate to a page with an HLS video</p>
      </div>
    `;
    return;
  }
  
  sourcesListEl.innerHTML = '';
  sources.forEach(source => {
    sourcesListEl.appendChild(createSourceElement(source));
  });
}

async function loadSources(): Promise<void> {
  const sources = await getSources();
  renderSources(sources);
}

clearBtn.addEventListener('click', async () => {
  if (confirm('Clear all detected sources?')) {
    await clearSources();
    await loadSources();
  }
});

chrome.runtime.onMessage.addListener((message: any) => {
  if (message.type === 'NEW_SOURCE_DETECTED') {
    loadSources();
  }
});

loadSources();
setInterval(loadSources, 2000);

