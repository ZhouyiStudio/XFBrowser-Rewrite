/* ===========================================================
   XFBrowser - Fluent 下载管理面板
   纯 ES Module
   =========================================================== */

import { FluentUtils, bus } from './fluent-utils.js';

export class DownloadManager {
  constructor(container) {
    this.container = container;
    this.downloads = [];
    this._init();
  }

  _init() {
    this.panel = FluentUtils.createElement('div', { class: 'xf-downloads' });
    this.container.appendChild(this.panel);

    bus.on('download-start', (data) => this.addDownload(data));
    bus.on('download-progress', (data) => this.updateProgress(data));
    bus.on('download-complete', (id) => this.completeDownload(id));
  }

  addDownload(data) {
    const item = FluentUtils.createElement('div', {
      class: 'xf-download-item',
      'data-download-id': data.id
    }, [
      FluentUtils.createElement('div', { class: 'xf-download-icon' }, [
        FluentUtils.icon('<path d="M2 12h12v2H2v-2zm6-9v6M4 9l4 4 4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>')
      ]),
      FluentUtils.createElement('div', { class: 'xf-download-info' }, [
        FluentUtils.createElement('div', { class: 'xf-download-name' }, [data.name]),
        FluentUtils.createElement('div', { class: 'xf-download-status' }, ['正在下载...']),
        FluentUtils.createElement('div', { class: 'xf-download-progress' }, [
          FluentUtils.createElement('div', {
            class: 'xf-download-progress-bar',
            style: { width: '0%' }
          })
        ])
      ])
    ]);

    this.panel.appendChild(item);
    this.downloads.push(data);
  }

  updateProgress(data) {
    const item = this.panel.querySelector(`[data-download-id="${data.id}"]`);
    if (!item) return;
    const bar = item.querySelector('.xf-download-progress-bar');
    const status = item.querySelector('.xf-download-status');
    if (bar) bar.style.width = Math.min(data.percent, 100) + '%';
    if (status) status.textContent = data.percent + '%';
  }

  completeDownload(id) {
    const item = this.panel.querySelector(`[data-download-id="${id}"]`);
    if (!item) return;
    const status = item.querySelector('.xf-download-status');
    const bar = item.querySelector('.xf-download-progress-bar');
    if (status) status.textContent = '下载完成';
    if (bar) bar.style.width = '100%';
  }
}
