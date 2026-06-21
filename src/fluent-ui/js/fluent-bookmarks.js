/* ===========================================================
   XFBrowser - Fluent 书签管理
   纯 ES Module
   =========================================================== */

import { FluentUtils, bus } from './fluent-utils.js';

export class BookmarkManager {
  constructor(container) {
    this.container = container;
    this.bookmarks = [];
    this._init();
    this._load();
  }

  _init() {
    this.bar = FluentUtils.createElement('div', { class: 'xf-bookmarks-bar' });
    this.container.appendChild(this.bar);
  }

  _load() {
    try {
      const data = JSON.parse(localStorage.getItem('xf-bookmarks'));
      if (Array.isArray(data)) this.bookmarks = data;
    } catch {}
    this._render();
  }

  _save() {
    localStorage.setItem('xf-bookmarks', JSON.stringify(this.bookmarks));
  }

  _render() {
    this.bar.innerHTML = '';
    this.bookmarks.forEach(bm => {
      this.bar.appendChild(this._createItem(bm));
    });
  }

  _createItem(bm) {
    if (bm.children) {
      return this._createFolder(bm);
    }
    return FluentUtils.createElement('a', {
      class: 'xf-bookmark-item',
      href: bm.url,
      title: bm.title
    }, [
      bm.icon
        ? FluentUtils.createElement('img', { class: 'xf-bookmark-item-icon', src: bm.icon, alt: '' })
        : FluentUtils.icon('<path d="M2 2h12v12H2V2z" fill="currentColor" opacity="0.2"/>'),
      document.createTextNode(bm.title)
    ]);
  }

  _createFolder(bm) {
    const folder = FluentUtils.createElement('div', { class: 'xf-bookmark-folder' }, [
      FluentUtils.icon('<path d="M1 3h5l2 2h7v9H1V3z" fill="currentColor" opacity="0.2"/>'),
      FluentUtils.createElement('span', {}, [bm.title])
    ]);

    if (bm.children && bm.children.length > 0) {
      const dropdown = FluentUtils.createElement('div', { class: 'xf-bookmark-dropdown' });
      bm.children.forEach(child => {
        dropdown.appendChild(this._createItem(child));
      });
      folder.appendChild(dropdown);
    }

    return folder;
  }

  addBookmark(bookmark) {
    this.bookmarks.push(bookmark);
    this._save();
    this._render();
  }

  removeBookmark(url) {
    this.bookmarks = this.bookmarks.filter(b => b.url !== url);
    this._save();
    this._render();
  }

  isBookmarked(url) {
    return this.bookmarks.some(b => b.url === url);
  }
}
