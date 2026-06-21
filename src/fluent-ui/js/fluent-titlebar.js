/* ===========================================================
   XFBrowser - Fluent 自定义标题栏
   支持 Mica/Acrylic 材质背景
   纯 ES Module
   =========================================================== */

import { FluentUtils } from './fluent-utils.js';

export class FluentTitleBar {
  constructor(container) {
    this.container = container;
    this._init();
  }

  _init() {
    this.el = FluentUtils.createElement('div', { class: 'xf-titlebar' }, [
      this._createIcon(),
      this._createTitle(),
      this._createControls()
    ]);
    this.container.prepend(this.el);
  }

  _createIcon() {
    return FluentUtils.createElement('div', { class: 'xf-titlebar-icon' }, [
      FluentUtils.createElement('img', {
        src: 'data:image/svg+xml,' + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#005fb8"/><path d="M8 2l2.5 5 5.5.8-4 3.9L13 16l-5-2.6L3 16l1-5.8-4-3.9 5.5-.8L8 2z" fill="white" opacity="0.9"/></svg>'
        ),
        alt: 'XFBrowser'
      })
    ]);
  }

  _createTitle() {
    this.titleEl = FluentUtils.createElement('div', { class: 'xf-titlebar-title' }, ['XFBrowser']);
    return this.titleEl;
  }

  _createControls() {
    const controls = FluentUtils.createElement('div', { class: 'xf-titlebar-controls' });

    // 最小化
    controls.appendChild(FluentUtils.createElement('button', {
      class: 'xf-titlebar-btn',
      onclick: () => window.chrome?.send?.('minimize') || window.close(),
      title: '最小化'
    }, [FluentUtils.icon('<path d="M2 8h12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>')]));

    // 最大化/还原
    this.maxBtn = FluentUtils.createElement('button', {
      class: 'xf-titlebar-btn',
      onclick: () => this._toggleMaximize(),
      title: '最大化'
    }, [FluentUtils.icon('<path d="M2 2h12v12H2V2zm1 1v10h10V3H3z" stroke="currentColor" stroke-width="1.2"/>')]);
    controls.appendChild(this.maxBtn);

    // 关闭
    controls.appendChild(FluentUtils.createElement('button', {
      class: 'xf-titlebar-btn xf-titlebar-btn-close',
      onclick: () => window.chrome?.send?.('close') || window.close(),
      title: '关闭'
    }, [FluentUtils.icon('<path d="M4 4l8 8m0-8l-8 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>')]));

    return controls;
  }

  _toggleMaximize() {
    // 通过 Chrome 原生 API 或 IPC 通信
    window.chrome?.send?.('maximize');
  }

  setTitle(title) {
    this.titleEl.textContent = title;
  }
}
