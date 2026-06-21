/* ===========================================================
   XFBrowser - DNS-over-HTTPS (DoH) 加密 DNS 配置
   默认使用国内公共 DoH 服务器
   纯 ES Module
   =========================================================== */

export class DoHConfig {
  constructor() {
    this._enabled = true;
    this._mode = 'secure'; // secure | fallback | off
    this._providers = [
      {
        name: '腾讯 DNSPod',
        url: 'https://doh.pub/dns-query',
        backup: 'https://dns.pub/dns-query',
        location: '中国'
      },
      {
        name: '阿里 DNS',
        url: 'https://dns.alidns.com/dns-query',
        location: '中国'
      },
      {
        name: 'Cloudflare',
        url: 'https://cloudflare-dns.com/dns-query',
        location: '全球'
      },
      {
        name: 'Google',
        url: 'https://dns.google/dns-query',
        location: '全球'
      }
    ];
    this._activeProvider = this._providers[0];
    this._dnsCache = new Map();
  }

  /** 获取 DoH 解析器 URL */
  getResolverUrl() {
    if (!this._enabled || this._mode === 'off') return null;
    return this._activeProvider.url;
  }

  /** 获取当前 DoH 模式 */
  getMode() {
    return this._mode;
  }

  /** 设置 DoH 模式 */
  setMode(mode) {
    if (['secure', 'fallback', 'off'].includes(mode)) {
      this._mode = mode;
    }
  }

  /** 切换 DNS 提供商 */
  setProvider(index) {
    if (index >= 0 && index < this._providers.length) {
      this._activeProvider = this._providers[index];
      this._dnsCache.clear();
    }
  }

  /** 获取提供商列表 */
  getProviders() {
    return this._providers.map((p, i) => ({
      ...p,
      active: p === this._activeProvider
    }));
  }

  /** 解析域名（使用 DoH） */
  async resolve(domain, type = 'A') {
    if (!this._enabled || this._mode === 'off') return null;

    const cacheKey = `${domain}:${type}`;
    if (this._dnsCache.has(cacheKey)) {
      const cached = this._dnsCache.get(cacheKey);
      if (Date.now() - cached.time < 300000) { // 5 分钟缓存
        return cached.data;
      }
      this._dnsCache.delete(cacheKey);
    }

    try {
      const url = new URL(this._activeProvider.url);
      url.searchParams.set('name', domain);
      url.searchParams.set('type', type);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url.toString(), {
        headers: { 'Accept': 'application/dns-json' },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) return null;

      const data = await response.json();
      this._dnsCache.set(cacheKey, { data, time: Date.now() });
      return data;
    } catch {
      // 失败时尝试备用服务器
      if (this._activeProvider.backup) {
        try {
          const url = new URL(this._activeProvider.backup);
          url.searchParams.set('name', domain);
          url.searchParams.set('type', type);
          const response = await fetch(url.toString(), {
            headers: { 'Accept': 'application/dns-json' }
          });
          if (response.ok) {
            const data = await response.json();
            return data;
          }
        } catch {}
      }
      return null;
    }
  }

  /** 获取加密 DNS 配置状态 */
  getStatus() {
    return {
      enabled: this._enabled,
      mode: this._mode,
      provider: this._activeProvider.name,
      cacheSize: this._dnsCache.size
    };
  }

  /** 启用/禁用 */
  setEnabled(val) {
    this._enabled = val;
  }
}
