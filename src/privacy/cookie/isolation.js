/* ===========================================================
   XFBrowser - 第三方 Cookie 隔离 + 反追踪
   每域名独立存储分区，禁止第三方 Cookie
   纯 ES Module
   =========================================================== */

export class CookieIsolation {
  constructor() {
    this._blockThirdParty = true;
    this._enabled = true;
    this._allowedDomains = new Set();
  }

  /** 判断是否允许设置 Cookie */
  shouldAllowCookie(request) {
    if (!this._enabled) return true;

    const { url, domain, thirdParty } = request;

    // 第三方 Cookie 默认拦截
    if (thirdParty && this._blockThirdParty) {
      // 白名单例外
      if (this._allowedDomains.has(domain)) return true;
      return false;
    }

    return true;
  }

  /** 获取隔离的存储分区 key */
  getStoragePartition(topLevelDomain, frameDomain) {
    // 为每对 (顶级域名, 框架域名) 返回独立分区
    return `partitioned:${topLevelDomain}:${frameDomain}`;
  }

  /** 添加 Cookie 白名单域名 */
  addAllowedDomain(domain) {
    this._allowedDomains.add(domain);
  }

  /** 移除白名单域名 */
  removeAllowedDomain(domain) {
    this._allowedDomains.delete(domain);
  }

  /** 设置第三方 Cookie 策略 */
  setBlockThirdParty(block) {
    this._blockThirdParty = block;
  }

  /** 启用/禁用 */
  setEnabled(val) {
    this._enabled = val;
  }
}

/* ---- 反追踪保护 ---- */
export class TrackingProtection {
  constructor() {
    this._blockedTrackers = new Set();
    this._knownTrackers = new Set([
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.net',
      'fbcdn.net',
      'doubleclick.net',
      'adservice.google.com',
      'amazon-adsystem.com',
      'ads.linkedin.com',
      'bat.bing.com',
      'snapchat.com',
      'pinterest.com',
      'twitter.com/i/jot',
      't.co',
      'redditstatic.com',
      'quantserve.com',
      'scorecardresearch.com',
      'outbrain.com',
      'taboola.com',
      'hotjar.com',
      'fullstory.com',
      'clarity.ms',
      'analytics.tiktok.com',
      'ads.yahoo.com',
      'advertising.com',
    ]);
  }

  /** 判断请求是否是追踪器 */
  isTracker(url) {
    for (const tracker of this._knownTrackers) {
      if (url.includes(tracker)) {
        this._blockedTrackers.add(tracker);
        return true;
      }
    }
    return false;
  }

  /** 获取被拦截的追踪器列表 */
  getBlockedTrackers() {
    return Array.from(this._blockedTrackers);
  }

  /** 获取拦截统计 */
  getStats() {
    return {
      total: this._blockedTrackers.size,
      trackers: Array.from(this._blockedTrackers)
    };
  }
}
