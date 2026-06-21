/* ===========================================================
   XFBrowser - Fluent 多标签管理系统
   纯 ES Module，支持拖拽排序 / 分组 / 休眠 / 会话恢复
   =========================================================== */

import { FluentUtils, bus } from './fluent-utils.js';

export class TabManager {
  constructor(container) {
    this.container = container;
    this.tabs = [];
    this.activeTabId = null;
    this._dragState = null;
    this._init();
    this._loadSession();
  }

  _init() {
    this.tabstrip = this.container.querySelector('.xf-tabstrip')
      || FluentUtils.createElement('div', { class: 'xf-tabstrip' });
    this.container.prepend(this.tabstrip);

    this._setupDragDrop();
    this._setupShortcuts();
    this._setupAutoSleep();

    bus.on('tab-new', () => this.createTab());
    bus.on('tab-close', (id) => this.closeTab(id));
  }

  createTab(url = 'about:blank', options = {}) {
    const id = crypto.randomUUID();
    const tab = {
      id,
      url,
      title: options.title || '新标签页',
      icon: options.icon || '',
      loading: false,
      muted: options.muted || false,
      groupId: options.groupId || null,
      pinned: options.pinned || false,
      created: Date.now(),
      lastAccessed: Date.now()
    };

    this.tabs.push(tab);
    this._renderTab(tab);
    this.activateTab(id);
    this._saveSession();
    bus.emit('tab-created', tab);
    return tab;
  }

  closeTab(id) {
    const idx = this.tabs.findIndex(t => t.id === id);
    if (idx === -1) return;
    this.tabs.splice(idx, 1);

    const el = this.tabstrip.querySelector(`[data-tab-id="${id}"]`);
    if (el) el.remove();

    if (this.activeTabId === id) {
      const next = this.tabs[Math.min(idx, this.tabs.length - 1)];
      if (next) this.activateTab(next.id);
    }
    this._saveSession();
    bus.emit('tab-closed', id);
  }

  activateTab(id) {
    this.tabs.forEach(t => {
      t.active = t.id === id;
      if (t.active) t.lastAccessed = Date.now();
    });
    this.activeTabId = id;
    this.tabstrip.querySelectorAll('.xf-tab').forEach(el => {
      el.classList.toggle('xf-tab-active', el.dataset.tabId === id);
    });
    bus.emit('tab-activated', id);
  }

  _renderTab(tab) {
    const el = FluentUtils.createElement('div', {
      class: 'xf-tab',
      'data-tab-id': tab.id,
      'data-group-id': tab.groupId || '',
      draggable: 'true',
      title: tab.title
    }, [
      FluentUtils.createElement('div', { class: 'xf-tab-icon' }, [
        tab.icon
          ? FluentUtils.createElement('img', { src: tab.icon, alt: '' })
          : FluentUtils.icon('<rect width="16" height="16" rx="2" fill="currentColor" opacity="0.2"/>')
      ]),
      FluentUtils.createElement('span', { class: 'xf-tab-title' }, [tab.title]),
      tab.muted
        ? FluentUtils.createElement('div', { class: 'xf-tab-audio' }, [
            FluentUtils.icon('<path d="M8 1L4 5H1v6h3l4 4V1zm3.5 2.5l-.7.7A4 4 0 0112 8a4 4 0 01-1.2 2.8l.7.7A5 5 0 0013 8a5 5 0 00-1.5-3.5z" fill="currentColor"/>')
          ])
        : null,
      FluentUtils.createElement('button', {
        class: 'xf-tab-close',
        onclick: (e) => { e.stopPropagation(); this.closeTab(tab.id); }
      }, [FluentUtils.icon('<path d="M4 4l8 8m0-8l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>')])
    ].filter(Boolean));

    el.addEventListener('click', () => this.activateTab(tab.id));
    el.addEventListener('dblclick', () => bus.emit('tab-dblclick', tab.id));
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      bus.emit('tab-contextmenu', { id: tab.id, x: e.clientX, y: e.clientY });
    });
    el.addEventListener('dragstart', (e) => this._onDragStart(e, tab.id));
    el.addEventListener('dragend', () => this._onDragEnd());

    // 插入到新标签按钮之前
    const newBtn = this.tabstrip.querySelector('.xf-tab-new');
    if (newBtn) {
      this.tabstrip.insertBefore(el, newBtn);
    } else {
      this.tabstrip.appendChild(el);
    }

    if (tab.active) el.classList.add('xf-tab-active');
  }

  _setupDragDrop() {
    this.tabstrip.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!this._dragState) return;
      const after = this._getDropTarget(e.clientX);
      this._showDropIndicator(after);
    });

    this.tabstrip.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!this._dragState) return;
      const targetId = this._getDropTarget(e.clientX);
      this._moveTab(this._dragState.tabId, targetId);
      this._hideDropIndicator();
      this._dragState = null;
    });
  }

  _onDragStart(e, tabId) {
    this._dragState = { tabId, startX: e.clientX };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabId);
    setTimeout(() => e.target.classList.add('xf-tab-dragging'), 0);
  }

  _onDragEnd() {
    this._dragState = null;
    this._hideDropIndicator();
    this.tabstrip.querySelectorAll('.xf-tab').forEach(el =>
      el.classList.remove('xf-tab-dragging'));
  }

  _getDropTarget(x) {
    const tabs = this.tabstrip.querySelectorAll('.xf-tab');
    for (const tab of tabs) {
      const rect = tab.getBoundingClientRect();
      if (x < rect.left + rect.width / 2) return tab.dataset.tabId;
    }
    return null;
  }

  _showDropIndicator(targetId) {
    this._hideDropIndicator();
    if (!targetId) return;
    const el = this.tabstrip.querySelector(`[data-tab-id="${targetId}"]`);
    if (!el) return;
    const ind = FluentUtils.createElement('div', { class: 'xf-tab-drop-indicator' });
    el.parentNode.insertBefore(ind, el);
  }

  _hideDropIndicator() {
    this.tabstrip.querySelectorAll('.xf-tab-drop-indicator').forEach(el => el.remove());
  }

  _moveTab(tabId, targetId) {
    const srcIdx = this.tabs.findIndex(t => t.id === tabId);
    const dstIdx = targetId ? this.tabs.findIndex(t => t.id === targetId) : this.tabs.length - 1;
    if (srcIdx === -1 || dstIdx === -1) return;
    const [tab] = this.tabs.splice(srcIdx, 1);
    this.tabs.splice(dstIdx, 0, tab);
    this._reorderDom();
    this._saveSession();
    bus.emit('tab-moved', { tabId, toIndex: dstIdx });
  }

  _reorderDom() {
    this.tabs.forEach(t => {
      const el = this.tabstrip.querySelector(`[data-tab-id="${t.id}"]`);
      if (el) this.tabstrip.appendChild(el);
    });
  }

  _setupShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        this.createTab();
      }
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        if (this.activeTabId) this.closeTab(this.activeTabId);
      }
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        this._cycleTab(e.shiftKey ? -1 : 1);
      }
    });
  }

  _cycleTab(dir) {
    const idx = this.tabs.findIndex(t => t.id === this.activeTabId);
    const next = (idx + dir + this.tabs.length) % this.tabs.length;
    if (this.tabs[next]) this.activateTab(this.tabs[next].id);
  }

  _setupAutoSleep() {
    setInterval(() => {
      const now = Date.now();
      this.tabs.forEach(tab => {
        if (tab.id === this.activeTabId) return;
        if (now - tab.lastAccessed > 30 * 60 * 1000 && !tab.pinned) {
          if (!tab.sleeping) {
            tab.sleeping = true;
            bus.emit('tab-sleep', tab.id);
          }
        }
      });
    }, 60000);
  }

  _saveSession() {
    const data = this.tabs.map(t => ({
      url: t.url, title: t.title, icon: t.icon,
      groupId: t.groupId, pinned: t.pinned
    }));
    try {
      sessionStorage.setItem('xf-tab-session', JSON.stringify(data));
    } catch {}
  }

  _loadSession() {
    try {
      const data = JSON.parse(sessionStorage.getItem('xf-tab-session'));
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(t => this.createTab(t.url, t));
        return;
      }
    } catch {}
    this.createTab('about:blank');
  }

  getTab(id) {
    return this.tabs.find(t => t.id === id);
  }

  getTabCount() {
    return this.tabs.length;
  }

  getTabsByGroup(groupId) {
    return this.tabs.filter(t => t.groupId === groupId);
  }
}
