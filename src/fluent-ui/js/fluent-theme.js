/* ===========================================================
   XFBrowser - Fluent 主题管理（深浅色自适应）
   纯 ES Module，监听系统主题变化
   =========================================================== */

import { bus, FluentUtils } from './fluent-utils.js';

class FluentTheme {
  constructor() {
    this._currentTheme = localStorage.getItem('xf-theme') || 'system';
    this._resolvedTheme = 'light';
    this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this._init();
  }

  _init() {
    this._apply();
    this._mediaQuery.addEventListener('change', () => {
      if (this._currentTheme === 'system') {
        this._applySystem();
      }
    });
  }

  _applySystem() {
    this._resolvedTheme = FluentUtils.isDarkMode() ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this._resolvedTheme);
    bus.emit('theme-changed', this._resolvedTheme);
  }

  _apply() {
    if (this._currentTheme === 'system') {
      this._applySystem();
    } else {
      this._resolvedTheme = this._currentTheme;
      document.documentElement.setAttribute('data-theme', this._currentTheme);
      bus.emit('theme-changed', this._currentTheme);
    }
  }

  get theme() {
    return this._currentTheme;
  }

  get resolvedTheme() {
    return this._resolvedTheme;
  }

  setTheme(theme) {
    if (!['light', 'dark', 'system'].includes(theme)) return;
    this._currentTheme = theme;
    localStorage.setItem('xf-theme', theme);
    this._apply();
  }

  toggle() {
    const next = this._resolvedTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }
}

export const theme = new FluentTheme();
