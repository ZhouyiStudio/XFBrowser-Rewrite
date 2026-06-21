/* ===========================================================
   XFBrowser - Fluent 地址栏模块
   纯 ES Module
   =========================================================== */

import { FluentUtils, bus } from './fluent-utils.js';

export class AddressBar {
  constructor(container) {
    this.container = container;
    this._init();
  }

  _init() {
    this.el = FluentUtils.createElement('div', { class: 'xf-addressbar' }, [
      this._createContainer()
    ]);
    this.container.prepend(this.el);
  }

  _createContainer() {
    this.input = FluentUtils.createElement('input', {
      class: 'xf-addressbar-input',
      type: 'text',
      placeholder: '搜索或输入网址',
      autocomplete: 'off',
      spellcheck: 'false',
      onfocus: () => this._onFocus(),
      onblur: () => this._onBlur(),
      onkeydown: (e) => this._onKeyDown(e),
      oninput: FluentUtils.debounce(() => this._onInput())
    });

    this.dropdown = FluentUtils.createElement('div', {
      class: 'xf-addressbar-dropdown'
    });

    const container = FluentUtils.createElement('div', { class: 'xf-addressbar-container' }, [
      this._createSecurityIcon(),
      this.input,
      this._createActions()
    ]);

    const wrapper = FluentUtils.createElement('div', {
      style: { position: 'relative', flex: '1' }
    }, [container, this.dropdown]);

    return wrapper;
  }

  _createSecurityIcon() {
    this.securityIcon = FluentUtils.createElement('div', { class: 'xf-addressbar-security' }, [
      FluentUtils.icon('<path d="M8 1l6 2v5c0 3.3-2.7 6-6 7-3.3-1-6-3.7-6-7V3l6-2zm0 1.5L3.5 4.2v3.8c0 2.8 2 5 4.5 5.7 2.5-.7 4.5-2.9 4.5-5.7V4.2L8 2.5zm-1 4.5l2 2 2.5-2.5-.7-.7L9 7.3 7.7 6l-.7.7z" fill="currentColor"/>')
    ]);
    return this.securityIcon;
  }

  _createActions() {
    const actions = FluentUtils.createElement('div', { class: 'xf-addressbar-actions' });

    // 刷新按钮
    actions.appendChild(FluentUtils.createElement('button', {
      class: 'xf-addressbar-btn',
      onclick: () => bus.emit('navigate-reload'),
      title: '刷新'
    }, [FluentUtils.icon('<path d="M2 8a6 6 0 0110.5-3.8l1.5-1.5v5h-5l1.3-1.3A4 4 0 004 8H2zm12 0a6 6 0 01-10.5 3.8L2 13.3v-5h5l-1.3 1.3A4 4 0 0012 8h2z" fill="currentColor"/>')]));

    // 书签星标
    this.starBtn = FluentUtils.createElement('button', {
      class: 'xf-addressbar-btn xf-addressbar-star',
      onclick: () => bus.emit('bookmark-toggle'),
      title: '添加书签'
    }, [FluentUtils.icon('<path d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.5l-3.6 1.9.7-4L2.2 5.2l4-.6L8 1z" fill="currentColor"/>')]);

    actions.appendChild(this.starBtn);

    return actions;
  }

  setUrl(url) {
    this.input.value = url || '';
  }

  setSecure(isSecure) {
    this.securityIcon.dataset.secure = String(isSecure);
  }

  setBookmarked(bookmarked) {
    this.starBtn.dataset.bookmarked = String(bookmarked);
  }

  _onFocus() {
    this.input.select();
    this.dropdown.dataset.open = 'true';
  }

  _onBlur() {
    setTimeout(() => {
      this.dropdown.dataset.open = 'false';
    }, 200);
  }

  _onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this._navigate(this.input.value);
    }
    if (e.key === 'Escape') {
      this.input.blur();
    }
  }

  _onInput() {
    const val = this.input.value.trim();
    if (val.length > 0) {
      this._showSuggestions(val);
    } else {
      this._clearSuggestions();
    }
  }

  _navigate(input) {
    let url = input.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      if (/^[\w.-]+\.[a-z]{2,}/i.test(url)) {
        url = 'https://' + url;
      } else {
        url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
      }
    }
    bus.emit('navigate', url);
    this.input.blur();
  }

  _showSuggestions(query) {
    this._clearSuggestions();
    const suggestions = this._getSuggestions(query);
    suggestions.forEach(s => {
      const item = FluentUtils.createElement('div', {
        class: 'xf-autocomplete-item',
        onclick: () => this._navigate(s.url)
      }, [
        FluentUtils.createElement('div', { class: 'xf-autocomplete-item-icon' }, [
          FluentUtils.icon(s.icon)
        ]),
        FluentUtils.createElement('div', { class: 'xf-autocomplete-item-content' }, [
          FluentUtils.createElement('div', { class: 'xf-autocomplete-item-title' }, [s.title]),
          FluentUtils.createElement('div', { class: 'xf-autocomplete-item-url' }, [s.url])
        ])
      ]);
      this.dropdown.appendChild(item);
    });
  }

  _clearSuggestions() {
    this.dropdown.innerHTML = '';
  }

  _getSuggestions(query) {
    // 模拟建议数据 - 正式版接入搜索引擎API
    return [
      { title: query, url: 'https://www.google.com/search?q=' + encodeURIComponent(query), icon: '<circle cx="8" cy="8" r="6" fill="currentColor" opacity="0.1"/><path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 10a4 4 0 110-8 4 4 0 010 8z" fill="currentColor"/>' }
    ];
  }
}
