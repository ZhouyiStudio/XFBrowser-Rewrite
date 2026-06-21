/* ===========================================================
   XFBrowser - 设置页应用
   纯 ES Module，所有设置本地持久化
   =========================================================== */

import { theme } from '../../fluent-ui/js/fluent-theme.js';

class SettingsApp {
  constructor() {
    this._settings = this._loadSettings();
    this._bindControls();
    this._applySettings();
  }

  _loadSettings() {
    try {
      return JSON.parse(localStorage.getItem('xf-settings')) || {};
    } catch {
      return {};
    }
  }

  _saveSettings() {
    localStorage.setItem('xf-settings', JSON.stringify(this._settings));
  }

  _bindControls() {
    // 外观
    this._bindSelect('themeSelect', (val) => {
      theme.setTheme(val);
      this._settings.theme = val;
    });

    this._bindToggle('materialToggle', (val) => {
      this._settings.windowMaterial = val;
      this._saveSettings();
    });

    this._bindToggle('sidePanelToggle', (val) => {
      this._settings.sidePanel = val;
      this._saveSettings();
      this._showToast(val ? '侧边标签已开启' : '侧边标签已关闭');
    });

    // 隐私与安全
    this._bindToggle('adblockToggle', (val) => {
      this._settings.adblock = val;
      this._saveSettings();
    });

    this._bindToggle('fingerprintToggle', (val) => {
      this._settings.fingerprint = val;
      this._saveSettings();
    });

    this._bindToggle('cookieToggle', (val) => {
      this._settings.blockThirdPartyCookies = val;
      this._saveSettings();
    });

    this._bindToggle('trackingToggle', (val) => {
      this._settings.trackingProtection = val;
      this._saveSettings();
    });

    this._bindSelect('dnsSelect', (val) => {
      this._settings.dohMode = val;
      this._saveSettings();
    });

    this._bindSelect('dnsProvider', (val) => {
      this._settings.dohProvider = parseInt(val);
      this._saveSettings();
    });

    // 标签页
    this._bindToggle('sleepToggle', (val) => {
      this._settings.autoSleep = val;
      this._saveSettings();
    });

    this._bindToggle('sessionRestoreToggle', (val) => {
      this._settings.restoreSession = val;
      this._saveSettings();
    });

    // 搜索引擎
    this._bindSelect('searchEngine', (val) => {
      this._settings.defaultSearchEngine = val;
      this._saveSettings();
    });
  }

  _applySettings() {
    const s = this._settings;
    if (s.theme) this._setSelect('themeSelect', s.theme);
    if (s.windowMaterial !== undefined) this._setToggle('materialToggle', s.windowMaterial);
    if (s.sidePanel !== undefined) this._setToggle('sidePanelToggle', s.sidePanel);
    if (s.adblock !== undefined) this._setToggle('adblockToggle', s.adblock);
    if (s.fingerprint !== undefined) this._setToggle('fingerprintToggle', s.fingerprint);
    if (s.blockThirdPartyCookies !== undefined) this._setToggle('cookieToggle', s.blockThirdPartyCookies);
    if (s.trackingProtection !== undefined) this._setToggle('trackingToggle', s.trackingProtection);
    if (s.dohMode) this._setSelect('dnsSelect', s.dohMode);
    if (s.dohProvider !== undefined) this._setSelect('dnsProvider', String(s.dohProvider));
    if (s.autoSleep !== undefined) this._setToggle('sleepToggle', s.autoSleep);
    if (s.restoreSession !== undefined) this._setToggle('sessionRestoreToggle', s.restoreSession);
    if (s.defaultSearchEngine) this._setSelect('searchEngine', s.defaultSearchEngine);
  }

  _bindToggle(id, onChange) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', () => onChange(el.checked));
  }

  _bindSelect(id, onChange) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', () => onChange(el.value));
  }

  _setToggle(id, val) {
    const el = document.getElementById(id);
    if (el) el.checked = Boolean(val);
  }

  _setSelect(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = String(val);
  }

  _showToast(msg) {
    let toast = document.querySelector('.xf-settings-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'xf-settings-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.dataset.show = 'true';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.dataset.show = 'false';
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SettingsApp();
});
