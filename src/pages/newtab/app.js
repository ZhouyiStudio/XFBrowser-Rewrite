/* ===========================================================
   XFBrowser - 新标签页应用
   纯 ES Module，零框架依赖
   可直接在浏览器中打开调试
   =========================================================== */

import { theme } from '../../fluent-ui/js/fluent-theme.js';

class NewTabApp {
  constructor() {
    this.shortcuts = [];
    this._init();
  }

  _init() {
    this._setGreeting();
    this._renderShortcuts();
    this._setupSearch();
    this._setupFooter();
    this._loadRecentTabs();
    theme.setTheme('system');
  }

  _setGreeting() {
    const el = document.getElementById('greeting');
    const hour = new Date().getHours();
    let greet = '你好';
    if (hour < 6) greet = '夜深了';
    else if (hour < 9) greet = '早上好';
    else if (hour < 12) greet = '上午好';
    else if (hour < 14) greet = '中午好';
    else if (hour < 18) greet = '下午好';
    else greet = '晚上好';
    el.textContent = greet;

    // 添加日期
    const dateEl = document.createElement('p');
    dateEl.className = 'ntp-date';
    dateEl.textContent = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    });
    el.after(dateEl);
  }

  _renderShortcuts() {
    const container = document.getElementById('shortcuts');
    const items = this._getShortcuts();

    items.forEach(item => {
      const tile = document.createElement('a');
      tile.className = 'ntp-tile';
      tile.href = item.url;
      tile.title = item.title;

      const icon = document.createElement('div');
      icon.className = 'ntp-tile-icon';
      if (item.icon) {
        const img = document.createElement('img');
        img.src = item.icon;
        img.alt = '';
        img.onerror = () => { icon.textContent = item.title[0]; };
        icon.appendChild(img);
      } else {
        icon.textContent = item.title[0];
      }

      const title = document.createElement('div');
      title.className = 'ntp-tile-title';
      title.textContent = item.title;

      tile.append(icon, title);
      container.appendChild(tile);
    });
  }

  _getShortcuts() {
    // 从 localStorage 读取
    try {
      const saved = JSON.parse(localStorage.getItem('xf-shortcuts'));
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch {}

    // 默认快捷方式
    return [
      { title: 'Google', url: 'https://www.google.com', icon: '' },
      { title: 'B站', url: 'https://www.bilibili.com', icon: '' },
      { title: 'GitHub', url: 'https://github.com', icon: '' },
      { title: '知乎', url: 'https://www.zhihu.com', icon: '' },
      { title: '百度', url: 'https://www.baidu.com', icon: '' },
      { title: '微博', url: 'https://weibo.com', icon: '' },
    ];
  }

  _setupSearch() {
    const input = document.getElementById('searchInput');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = input.value.trim();
        if (!val) return;

        let url = val;
        if (!/^https?:\/\//i.test(url)) {
          if (/^[\w.-]+\.[a-z]{2,}/i.test(url)) {
            url = 'https://' + url;
          } else {
            url = `https://www.google.com/search?q=${encodeURIComponent(val)}`;
          }
        }
        window.location.href = url;
      }
    });

    // 自动聚焦
    input.focus();
  }

  _setupFooter() {
    document.querySelectorAll('.ntp-footer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        switch (action) {
          case 'settings': window.location.href = 'chrome://settings'; break;
          case 'history': window.location.href = 'chrome://history'; break;
          case 'bookmarks': window.location.href = 'chrome://bookmarks'; break;
          case 'downloads': window.location.href = 'chrome://downloads'; break;
        }
      });
    });
  }

  _loadRecentTabs() {
    try {
      const recent = JSON.parse(sessionStorage.getItem('xf-recent-tabs'));
      if (Array.isArray(recent) && recent.length > 0) {
        const section = document.getElementById('recentSection');
        const list = document.getElementById('recentList');
        section.style.display = 'block';

        recent.slice(0, 5).forEach(tab => {
          const item = document.createElement('div');
          item.className = 'ntp-recent-item';
          item.innerHTML = `
            <div class="ntp-recent-item-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect width="16" height="16" rx="2" fill="currentColor" opacity="0.1"/>
                <path d="M3 4h10v8H3V4zm1 1v6h8V5H4z" fill="currentColor"/>
              </svg>
            </div>
            <span class="ntp-recent-item-title">${tab.title || tab.url}</span>
            <span class="ntp-recent-item-time">刚刚</span>
          `;
          item.addEventListener('click', () => {
            window.location.href = tab.url;
          });
          list.appendChild(item);
        });
      }
    } catch {}
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  new NewTabApp();
});
