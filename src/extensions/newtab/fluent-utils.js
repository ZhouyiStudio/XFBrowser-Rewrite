/* ===========================================================
   XFBrowser - Fluent UI 工具模块
   纯 ES Module，零依赖
   =========================================================== */

export const FluentUtils = {
  /** 创建元素快捷方法 */
  createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === 'class') {
        el.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else if (key === 'dataset') {
        Object.assign(el.dataset, value);
      } else {
        el.setAttribute(key, String(value));
      }
    }
    for (const child of children) {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    }
    return el;
  },

  /** SVG 图标工厂 */
  icon(svgContent, size = 16) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('fill', 'none');
    svg.innerHTML = svgContent;
    return svg;
  },

  /** 防抖 */
  debounce(fn, ms = 200) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  },

  /** 节流 */
  throttle(fn, ms = 100) {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn(...args);
      }
    };
  },

  /** 深色模式检测 */
  isDarkMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  /** 获取系统主题 */
  getSystemTheme() {
    return this.isDarkMode() ? 'dark' : 'light';
  },

  /** 格式化 URL 用于显示 */
  formatUrl(url) {
    try {
      const u = new URL(url);
      return u.hostname + u.pathname.replace(/\/$/, '');
    } catch {
      return url;
    }
  },

  /** 扁平化数组 */
  flatten(arr) {
    return arr.reduce((acc, val) =>
      Array.isArray(val) ? acc.concat(this.flatten(val)) : acc.concat(val), []);
  }
};

/** 事件总线 - 模块间通信 */
export class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  on(event, fn) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(fn);
    return () => this._listeners.get(event)?.delete(fn);
  }

  emit(event, data) {
    this._listeners.get(event)?.forEach(fn => fn(data));
  }

  off(event, fn) {
    this._listeners.get(event)?.delete(fn);
  }
}

export const bus = new EventBus();
