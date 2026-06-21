/* ===========================================================
   XFBrowser - Fluent 侧边垂直标签面板
   纯 ES Module
   =========================================================== */

import { FluentUtils, bus } from './fluent-utils.js';

export class SidePanel {
  constructor(container) {
    this.container = container;
    this._init();
  }

  _init() {
    this.el = FluentUtils.createElement('div', { class: 'xf-sidepanel' }, [
      this._createHeader(),
      this._createSearch(),
      this._createList()
    ]);
    this.container.appendChild(this.el);
  }

  _createHeader() {
    return FluentUtils.createElement('div', { class: 'xf-sidepanel-header' }, [
      FluentUtils.createElement('span', { class: 'xf-sidepanel-title' }, ['标签页']),
      FluentUtils.createElement('button', {
        class: 'xf-addressbar-btn',
        onclick: () => bus.emit('tab-new'),
        title: '新建标签'
      }, [FluentUtils.icon('<path d="M2 8h12M8 2v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>')])
    ]);
  }

  _createSearch() {
    const searchEl = FluentUtils.createElement('div', { class: 'xf-sidepanel-search' }, [
      FluentUtils.icon('<path d="M6.5 1a5.5 5.5 0 100 11 5.5 5.5 0 000-11zm0 10a4.5 4.5 0 110-9 4.5 4.5 0 010 9zM16 16l-4.5-4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'),
      FluentUtils.createElement('input', {
        type: 'text',
        placeholder: '搜索标签...',
        oninput: (e) => this._filter(e.target.value)
      })
    ]);
    return searchEl;
  }

  _createList() {
    this.listEl = FluentUtils.createElement('div', { class: 'xf-sidepanel-list' });
    return this.listEl;
  }

  addTab(tab) {
    const item = FluentUtils.createElement('div', {
      class: 'xf-sidepanel-tab',
      'data-tab-id': tab.id,
      onclick: () => bus.emit('tab-activate', tab.id)
    }, [
      FluentUtils.createElement('div', { class: 'xf-sidepanel-tab-icon' }, [
        tab.icon
          ? FluentUtils.createElement('img', { src: tab.icon, alt: '' })
          : FluentUtils.icon('<rect width="16" height="16" rx="2" fill="currentColor" opacity="0.2"/>')
      ]),
      FluentUtils.createElement('span', { class: 'xf-sidepanel-tab-title' }, [tab.title])
    ]);

    this.listEl.appendChild(item);
  }

  removeTab(id) {
    const el = this.listEl.querySelector(`[data-tab-id="${id}"]`);
    if (el) el.remove();
  }

  activateTab(id) {
    this.listEl.querySelectorAll('.xf-sidepanel-tab').forEach(el => {
      el.classList.toggle('xf-sidepanel-tab-active', el.dataset.tabId === id);
    });
  }

  _filter(query) {
    const q = query.toLowerCase();
    this.listEl.querySelectorAll('.xf-sidepanel-tab').forEach(el => {
      const title = el.querySelector('.xf-sidepanel-tab-title')?.textContent?.toLowerCase() || '';
      el.style.display = title.includes(q) ? '' : 'none';
    });
  }
}
