import { theme } from './fluent-theme.js';

const QUOTES = [
  { text: '千里之行，始于足下', author: '老子' },
  { text: '学而时习之，不亦说乎', author: '孔子' },
  { text: '不积跬步，无以至千里', author: '荀子' },
  { text: '天行健，君子以自强不息', author: '《周易》' },
  { text: '人生自古谁无死，留取丹心照汗青', author: '文天祥' },
  { text: '知识就是力量', author: '培根' },
  { text: 'Stay hungry, stay foolish', author: 'Steve Jobs' },
  { text: '简洁就是优雅', author: 'Antoine de Saint-Exupéry' },
  { text: '读万卷书，行万里路', author: '董其昌' },
];

class NewTabApp {
  constructor() {
    this.shortcuts = [];
    this._init();
  }

  _init() {
    this._setGreeting();
    this._setTimeBackground();
    this._setQuote();
    this._renderShortcuts();
    this._setupSearch();
    this._setupFooter();
    this._loadRecentTabs();
    this._startClock();
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
  }

  _setTimeBackground() {
    const hour = new Date().getHours();
    let gradient;
    if (hour < 6) {
      gradient = 'linear-gradient(135deg, #0c0d2e 0%, #1a1a3e 50%, #0d0d0d 100%)';
    } else if (hour < 9) {
      gradient = 'linear-gradient(135deg, #f5e6d3 0%, #fdf4e3 50%, #fff8f0 100%)';
    } else if (hour < 14) {
      gradient = 'linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 50%, #fafcff 100%)';
    } else if (hour < 18) {
      gradient = 'linear-gradient(135deg, #fef3e2 0%, #fdf6ec 50%, #fff9f2 100%)';
    } else {
      gradient = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
    }
    document.body.style.background = gradient;
  }

  _setQuote() {
    const el = document.getElementById('quoteText');
    const authorEl = document.getElementById('quoteAuthor');
    const idx = Math.floor(Math.random() * QUOTES.length);
    const quote = QUOTES[idx];
    el.textContent = `「${quote.text}」`;
    authorEl.textContent = `—— ${quote.author}`;
  }

  _startClock() {
    const update = () => {
      const now = new Date();
      const timeEl = document.getElementById('currentTime');
      if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('zh-CN', {
          hour: '2-digit', minute: '2-digit'
        });
      }
    };
    update();
    setInterval(update, 30000);
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
    try {
      const saved = JSON.parse(localStorage.getItem('xf-shortcuts'));
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch {}

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

        const engine = document.getElementById('searchEngine').value;
        const engines = {
          google: 'https://www.google.com/search?q=',
          bing: 'https://www.bing.com/search?q=',
          baidu: 'https://www.baidu.com/s?wd=',
          duckduckgo: 'https://duckduckgo.com/?q=',
        };

        let url = val;
        if (!/^https?:\/\//i.test(url)) {
          if (/^[\w.-]+\.[a-z]{2,}/i.test(url)) {
            url = 'https://' + url;
          } else {
            url = (engines[engine] || engines.google) + encodeURIComponent(val);
          }
        }
        window.location.href = url;
      }
    });

    input.focus();
  }

  _setupFooter() {
    document.querySelectorAll('.ntp-footer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        switch (action) {
          case 'settings': window.location.href = 'about:preferences'; break;
          case 'history': window.location.href = 'about:history'; break;
          case 'bookmarks': window.location.href = 'about:bookmarks'; break;
          case 'downloads': window.location.href = 'about:downloads'; break;
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

document.addEventListener('DOMContentLoaded', () => {
  new NewTabApp();
});
