/* ===========================================================
   XFBrowser - Fluent UI 交互控件库
   纯 ES Module
   =========================================================== */

import { FluentUtils } from './fluent-utils.js';

/* ---- 开关控件 Toggle ---- */
export class FluentToggle {
  constructor(options = {}) {
    this.checked = options.checked || false;
    this.onChange = options.onChange || (() => {});
    this.disabled = options.disabled || false;
    this.label = options.label || '';
    return this._render();
  }

  _render() {
    const id = 'toggle-' + crypto.randomUUID().slice(0, 8);

    this.input = FluentUtils.createElement('input', {
      type: 'checkbox',
      id,
      checked: this.checked ? 'true' : null,
      disabled: this.disabled ? 'true' : null,
      onchange: () => {
        this.checked = this.input.checked;
        this.onChange(this.checked);
      }
    });

    this.el = FluentUtils.createElement('label', { class: 'xf-toggle', for: id }, [
      this.input,
      FluentUtils.createElement('span', { class: 'xf-toggle-track' }),
      FluentUtils.createElement('span', { class: 'xf-toggle-thumb' })
    ]);

    return this.el;
  }

  setChecked(val) {
    this.checked = val;
    this.input.checked = val;
  }
}

/* ---- 按钮 Button ---- */
export class FluentButton {
  constructor(options = {}) {
    this.label = options.label || '按钮';
    this.variant = options.variant || 'default'; // default | primary | danger
    this.onClick = options.onClick || (() => {});
    this.icon = options.icon || null;
    this.disabled = options.disabled || false;
    return this._render();
  }

  _render() {
    const classes = ['xf-btn'];
    if (this.variant !== 'default') classes.push('xf-btn-' + this.variant);

    const children = [];
    if (this.icon) {
      children.push(FluentUtils.createElement('span', { class: 'xf-btn-icon' }, [
        typeof this.icon === 'string' ? FluentUtils.icon(this.icon) : this.icon
      ]));
    }
    children.push(document.createTextNode(this.label));

    this.el = FluentUtils.createElement('button', {
      class: classes.join(' '),
      disabled: this.disabled ? 'true' : null,
      onclick: this.onClick
    }, children);

    return this.el;
  }
}

/* ---- 下拉选择 Select ---- */
export class FluentSelect {
  constructor(options = {}) {
    this.options = options.options || [];
    this.value = options.value || '';
    this.onChange = options.onChange || (() => {});
    this.placeholder = options.placeholder || '请选择';
    return this._render();
  }

  _render() {
    this.el = FluentUtils.createElement('select', {
      class: 'xf-select',
      onchange: () => {
        this.value = this.el.value;
        this.onChange(this.value);
      }
    });

    if (this.placeholder) {
      this.el.appendChild(FluentUtils.createElement('option', {
        value: '', disabled: 'true', selected: !this.value ? 'true' : null
      }, [this.placeholder]));
    }

    this.options.forEach(opt => {
      const attrs = { value: opt.value };
      if (opt.value === this.value) attrs.selected = 'true';
      if (opt.disabled) attrs.disabled = 'true';
      this.el.appendChild(FluentUtils.createElement('option', attrs, [opt.label]));
    });

    return this.el;
  }

  setValue(val) {
    this.value = val;
    this.el.value = val;
  }
}

/* ---- 输入框 Input ---- */
export class FluentInput {
  constructor(options = {}) {
    this.placeholder = options.placeholder || '';
    this.value = options.value || '';
    this.type = options.type || 'text';
    this.onInput = options.onInput || (() => {});
    return this._render();
  }

  _render() {
    this.el = FluentUtils.createElement('input', {
      class: 'xf-input',
      type: this.type,
      placeholder: this.placeholder,
      value: this.value,
      oninput: (e) => {
        this.value = e.target.value;
        this.onInput(this.value);
      }
    });
    return this.el;
  }

  setValue(val) {
    this.value = val;
    this.el.value = val;
  }
}

/* ---- 菜单项 Menu Item ---- */
export class FluentMenuItem {
  constructor(options = {}) {
    this.label = options.label || '';
    this.icon = options.icon || null;
    this.shortcut = options.shortcut || '';
    this.disabled = options.disabled || false;
    this.danger = options.danger || false;
    this.onClick = options.onClick || (() => {});
    this.children = options.children || [];
    return this._render();
  }

  _render() {
    const attrs = { class: 'xf-context-item' };
    if (this.disabled) attrs['data-disabled'] = 'true';
    if (this.danger) attrs['data-danger'] = 'true';

    const children = [];

    if (this.icon) {
      children.push(FluentUtils.createElement('div', { class: 'xf-context-item-icon' }, [
        typeof this.icon === 'string' ? FluentUtils.icon(this.icon) : this.icon
      ]));
    }

    children.push(FluentUtils.createElement('span', { class: 'xf-context-item-label' }, [this.label]));

    if (this.shortcut) {
      children.push(FluentUtils.createElement('span', { class: 'xf-context-item-shortcut' }, [this.shortcut]));
    }

    if (this.children.length > 0) {
      children.push(FluentUtils.createElement('span', { class: 'xf-context-submenu-arrow' }, [
        FluentUtils.icon('<path d="M5 1l6 6-6 6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>')
      ]));
      const submenu = FluentUtils.createElement('div', { class: 'xf-context-submenu' });
      this.children.forEach(child => {
        submenu.appendChild(child instanceof Node ? child : new FluentMenuItem(child));
      });
      children.push(submenu);
    }

    this.el = FluentUtils.createElement('div', attrs, children);
    if (!this.disabled) {
      this.el.addEventListener('click', (e) => {
        if (this.children.length === 0) {
          e.stopPropagation();
          this.onClick();
        }
      });
    }

    return this.el;
  }
}

/* ---- 上下文菜单 Context Menu ---- */
export class FluentContextMenu {
  constructor() {
    this.el = FluentUtils.createElement('div', { class: 'xf-context-menu' });
    document.body.appendChild(this.el);
    this._setupClose();
  }

  show(items, x, y) {
    this.el.innerHTML = '';
    items.forEach(item => {
      if (item === 'separator') {
        this.el.appendChild(FluentUtils.createElement('div', { class: 'xf-context-separator' }));
      } else {
        this.el.appendChild(item instanceof Node ? item : new FluentMenuItem(item));
      }
    });

    // 定位
    const rect = this.el.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;
    this.el.style.left = Math.min(x, maxX) + 'px';
    this.el.style.top = Math.min(y, maxY) + 'px';
    this.el.dataset.open = 'true';
  }

  hide() {
    this.el.dataset.open = 'false';
  }

  _setupClose() {
    document.addEventListener('click', (e) => {
      if (!this.el.contains(e.target)) this.hide();
    });
    document.addEventListener('contextmenu', () => this.hide());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hide();
    });
  }
}
