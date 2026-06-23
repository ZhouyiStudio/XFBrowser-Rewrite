import { theme } from '../../fluent-ui/js/fluent-theme.js';

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
  { text: '行到水穷处，坐看云起时', author: '王维' },
  { text: '海内存知己，天涯若比邻', author: '王勃' },
  { text: '路漫漫其修远兮，吾将上下而求索', author: '屈原' },
];

const DEFAULTS = {
  theme: 'system',
  searchEngine: 'google',
  bgType: 'gradient',
  bgImage: '',
  shortcutCount: 8,
  showQuote: true,
  showRecent: true,
  showWeather: true,
};

class NewTabApp {
  constructor() {
    this.settings = this._loadSettings();
    this.shortcuts = [];
    this.editing = false;
    this._init();
  }

  _loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem('xf-settings'));
      return { ...DEFAULTS, ...saved };
    } catch {
      return { ...DEFAULTS };
    }
  }

  _saveSettings() {
    localStorage.setItem('xf-settings', JSON.stringify(this.settings));
  }

  async _init() {
    this._setGreeting();
    this._setDate();
    this._startClock();
    this._setQuote();
    await this._loadWeather();
    this._renderShortcuts();
    this._setupSearch();
    this._setupSettings();
    this._setupThemeToggle();
    this._setupShortcutManager();
    this._loadRecentTabs();
    this._applyBg();
    this._setupModals();
    this._setupToast();

    theme.setTheme(this.settings.theme);
    this._applyVisibility();
  }

  _setGreeting() {
    const el = document.getElementById('greeting');
    const hour = new Date().getHours();
    let greet = '你好';
    if (hour < 5) greet = '夜深了';
    else if (hour < 9) greet = '早上好';
    else if (hour < 12) greet = '上午好';
    else if (hour < 14) greet = '中午好';
    else if (hour < 18) greet = '下午好';
    else greet = '晚上好';
    el.textContent = greet;
  }

  _setDate() {
    const el = document.getElementById('currentDate');
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    el.textContent = now.toLocaleDateString('zh-CN', options);
  }

  _startClock() {
    const update = () => {
      const el = document.getElementById('currentTime');
      if (el) {
        el.textContent = new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit', minute: '2-digit'
        });
      }
    };
    update();
    setInterval(update, 10000);
  }

  _setQuote() {
    const el = document.getElementById('quoteText');
    const authorEl = document.getElementById('quoteAuthor');
    const idx = Math.floor(Math.random() * QUOTES.length);
    const quote = QUOTES[idx];
    el.textContent = `「${quote.text}」`;
    authorEl.textContent = `—— ${quote.author}`;
  }

  async _loadWeather() {
    const iconEl = document.getElementById('weatherIcon');
    const tempEl = document.getElementById('weatherTemp');
    const cityEl = document.getElementById('weatherCity');

    const updateWeather = (icon, temp, city) => {
      iconEl.textContent = icon;
      tempEl.textContent = temp;
      cityEl.textContent = city;
    };

    try {
      const cached = localStorage.getItem('xf-weather-cache');
      if (cached) {
        const { data, time } = JSON.parse(cached);
        if (Date.now() - time < 1800000) {
          updateWeather(data.icon, data.temp, data.city);
          return;
        }
      }

      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000, enableHighAccuracy: false
        });
      });

      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
      );
      const data = await res.json();

      const temp = Math.round(data.current_weather.temperature);
      const code = data.current_weather.weathercode;
      const wmoIcons = {
        0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️',
        45: '🌫', 48: '🌫', 51: '🌦', 53: '🌦', 55: '🌦',
        61: '🌧', 63: '🌧', 65: '🌧', 71: '🌨', 73: '🌨', 75: '🌨',
        80: '🌦', 81: '🌧', 82: '🌧', 95: '⛈', 96: '⛈', 99: '⛈',
      };
      const icon = wmoIcons[code] || '🌤';
      const city = data.timezone?.split('/').pop()?.replace('_', ' ') || '本地';

      updateWeather(icon, `${temp}°C`, city);

      localStorage.setItem('xf-weather-cache', JSON.stringify({
        data: { icon, temp: `${temp}°C`, city },
        time: Date.now()
      }));
    } catch {
      updateWeather('📍', '--°C', '未知');
    }
  }

  _renderShortcuts() {
    const container = document.getElementById('shortcuts');
    const items = this._getShortcuts();
    const max = this.settings.shortcutCount;

    container.innerHTML = '';

    const showAdd = items.length < max;
    const displayItems = items.slice(0, max);

    displayItems.forEach((item, i) => {
      const tile = document.createElement('a');
      tile.className = 'ntp-tile';
      if (this.editing) tile.classList.add('editing');
      tile.href = item.url;
      tile.title = item.title;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'ntp-tile-remove';
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._removeShortcut(i);
      });

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

      tile.append(removeBtn, icon, title);
      container.appendChild(tile);
    });

    if (showAdd) {
      const addTile = document.createElement('div');
      addTile.className = 'ntp-tile ntp-tile-add';
      addTile.innerHTML = `
        <div class="ntp-tile-icon">+</div>
        <div class="ntp-tile-title">添加</div>
      `;
      addTile.addEventListener('click', () => this._showAddShortcutModal());
      container.appendChild(addTile);
    }
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

  _saveShortcuts() {
    localStorage.setItem('xf-shortcuts', JSON.stringify(this.shortcuts));
  }

  _removeShortcut(index) {
    const items = this._getShortcuts();
    items.splice(index, 1);
    localStorage.setItem('xf-shortcuts', JSON.stringify(items));
    this._renderShortcuts();
    this._showToast('快捷方式已删除');
  }

  _setupSearch() {
    const input = document.getElementById('searchInput');
    const tips = document.getElementById('searchTips');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = input.value.trim();
        if (!val) return;

        this._doSearch(val, this.settings.searchEngine);
      }
    });

    input.addEventListener('input', () => {
      const val = input.value.trim();
      if (val && !val.includes(' ') && val.includes('.') && !/^https?:\/\//i.test(val)) {
        tips.textContent = `按 Enter 访问 https://${val}`;
        tips.classList.add('show');
      } else {
        tips.classList.remove('show');
      }
    });
  }

  _doSearch(val, engine) {
    const engines = {
      google: 'https://www.google.com/search?q=',
      bing: 'https://www.bing.com/search?q=',
      baidu: 'https://www.baidu.com/s?wd=',
      duckduckgo: 'https://duckduckgo.com/?q=',
      sogou: 'https://www.sogou.com/web?query=',
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

  _setupSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const modal = document.getElementById('settingsModal');
    const close = document.getElementById('settingsClose');
    const save = document.getElementById('saveSettings');
    const reset = document.getElementById('resetSettings');
    const backdrop = modal.querySelector('.ntp-modal-backdrop');

    const open = () => {
      this._populateSettingsModal();
      modal.classList.add('show');
    };

    const closeModal = () => modal.classList.remove('show');

    settingsBtn.addEventListener('click', open);
    document.querySelector('[data-action="settings"]').addEventListener('click', open);
    close.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    save.addEventListener('click', () => {
      this._saveSettingsFromModal();
      closeModal();
      this._showToast('设置已保存');
    });

    reset.addEventListener('click', () => {
      localStorage.removeItem('xf-settings');
      localStorage.removeItem('xf-theme');
      localStorage.removeItem('xf-bg-image');
      location.reload();
    });
  }

  _populateSettingsModal() {
    document.querySelectorAll('.ntp-theme-option').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === this.settings.theme);
    });
    document.getElementById('settingsSearchEngine').value = this.settings.searchEngine;

    document.querySelectorAll('.ntp-bg-option').forEach(el => {
      el.classList.toggle('active', el.dataset.bg === this.settings.bgType);
    });

    const bgInput = document.getElementById('bgImageInput');
    if (this.settings.bgType === 'image') {
      bgInput.style.display = 'flex';
      document.getElementById('bgImageUrl').value = this.settings.bgImage || '';
    } else {
      bgInput.style.display = 'none';
    }

    document.getElementById('shortcutCount').value = String(this.settings.shortcutCount);
    document.getElementById('showQuote').checked = this.settings.showQuote;
    document.getElementById('showRecent').checked = this.settings.showRecent;
    document.getElementById('showWeather').checked = this.settings.showWeather;

    document.querySelectorAll('.ntp-bg-option').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.ntp-bg-option').forEach(e => e.classList.remove('active'));
        el.classList.add('active');
        const bgInputInner = document.getElementById('bgImageInput');
        bgInputInner.style.display = el.dataset.bg === 'image' ? 'flex' : 'none';
      });
    });

    document.getElementById('applyBgImage').addEventListener('click', () => {
      const url = document.getElementById('bgImageUrl').value.trim();
      if (url) {
        this.settings.bgType = 'image';
        this.settings.bgImage = url;
        this._applyBg();
        this._showToast('背景已更新');
      }
    });
  }

  _saveSettingsFromModal() {
    const activeTheme = document.querySelector('.ntp-theme-option.active');
    if (activeTheme) this.settings.theme = activeTheme.dataset.theme;

    this.settings.searchEngine = document.getElementById('settingsSearchEngine').value;

    const activeBg = document.querySelector('.ntp-bg-option.active');
    if (activeBg) {
      this.settings.bgType = activeBg.dataset.bg;
      if (activeBg.dataset.bg === 'image') {
        this.settings.bgImage = document.getElementById('bgImageUrl').value.trim();
      }
    }

    this.settings.shortcutCount = parseInt(document.getElementById('shortcutCount').value, 10);
    this.settings.showQuote = document.getElementById('showQuote').checked;
    this.settings.showRecent = document.getElementById('showRecent').checked;
    this.settings.showWeather = document.getElementById('showWeather').checked;

    this._saveSettings();
    theme.setTheme(this.settings.theme);
    this._renderShortcuts();
    this._applyBg();
    this._applyVisibility();
  }

  _applyVisibility() {
    document.querySelector('.ntp-quote-section').style.display =
      this.settings.showQuote ? '' : 'none';
    const recentSection = document.getElementById('recentSection');
    if (!this.settings.showRecent) recentSection.style.display = 'none';
    document.getElementById('weather').style.display =
      this.settings.showWeather ? '' : 'none';
  }

  _setupThemeToggle() {
    const btn = document.getElementById('themeToggle');
    btn.addEventListener('click', () => {
      const current = theme.resolvedTheme;
      const next = current === 'dark' ? 'light' : 'dark';
      theme.setTheme(next);
      this.settings.theme = next;
      this._saveSettings();
    });
  }

  _setupShortcutManager() {
    const toggleEdit = document.getElementById('toggleEditShortcuts');
    toggleEdit.addEventListener('click', () => {
      this.editing = !this.editing;
      toggleEdit.classList.toggle('active', this.editing);
      this._renderShortcuts();
    });
  }

  _showAddShortcutModal() {
    const modal = document.getElementById('addShortcutModal');
    const close = document.getElementById('addShortcutClose');
    const cancel = document.getElementById('addShortcutCancel');
    const confirm = document.getElementById('addShortcutConfirm');
    const backdrop = modal.querySelector('.ntp-modal-backdrop');
    const nameInput = document.getElementById('shortcutName');
    const urlInput = document.getElementById('shortcutUrl');

    nameInput.value = '';
    urlInput.value = '';

    const closeModal = () => modal.classList.remove('show');

    modal.classList.add('show');

    const onConfirm = () => {
      const name = nameInput.value.trim();
      let url = urlInput.value.trim();
      if (!name || !url) return;

      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }

      const items = this._getShortcuts();
      items.push({ title: name, url, icon: '' });
      localStorage.setItem('xf-shortcuts', JSON.stringify(items));
      this._renderShortcuts();
      closeModal();
      this._showToast(`已添加快捷方式「${name}」`);
    };

    close.addEventListener('click', closeModal, { once: true });
    cancel.addEventListener('click', closeModal, { once: true });
    backdrop.addEventListener('click', closeModal, { once: true });
    confirm.addEventListener('click', onConfirm, { once: true });

    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') onConfirm();
    }, { once: true });
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
            <span class="ntp-recent-item-title">${tab.title || tab.url}</span>
            <span class="ntp-recent-item-time">刚刚</span>
          `;
          item.addEventListener('click', () => {
            window.location.href = tab.url;
          });
          list.appendChild(item);
        });

        document.getElementById('clearRecent').addEventListener('click', () => {
          sessionStorage.removeItem('xf-recent-tabs');
          section.style.display = 'none';
          list.innerHTML = '';
        });
      }
    } catch {}
  }

  _applyBg() {
    const overlay = document.querySelector('.ntp-bg-overlay');
    if (!overlay) return;

    switch (this.settings.bgType) {
      case 'gradient':
        overlay.style.background = '';
        overlay.style.opacity = '0';
        document.body.style.background = '';
        break;
      case 'solid':
        overlay.style.background = '';
        overlay.style.opacity = '0';
        document.body.style.background = this.settings.bgColor || '#f5f5f5';
        break;
      case 'image':
        if (this.settings.bgImage) {
          overlay.style.background = `url(${this.settings.bgImage}) center/cover no-repeat`;
          overlay.style.opacity = '0.3';
        }
        break;
    }
  }

  _setupModals() {
    document.querySelectorAll('.ntp-modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    });
  }

  _setupToast() {
    this._toastEl = document.getElementById('toast');
  }

  _showToast(msg) {
    const el = this._toastEl;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NewTabApp();
});
