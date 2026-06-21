const lazy = {};
ChromeUtils.defineESModuleGetters(lazy, {
  Services: "resource://gre/modules/Services.sys.mjs",
});

const Ci = Components.interfaces;

const TRR_MODE = {
  OFF: 0,
  FALLBACK: 2,
  ONLY: 3,
};

const PROVIDERS = [
  {
    name: 'Tencent DNSPod',
    url: 'https://doh.pub/dns-query',
    backup: 'https://dns.pub/dns-query',
    location: 'China',
  },
  {
    name: 'AliDNS',
    url: 'https://dns.alidns.com/dns-query',
    location: 'China',
  },
  {
    name: 'Cloudflare',
    url: 'https://cloudflare-dns.com/dns-query',
    location: 'Global',
  },
  {
    name: 'Google',
    url: 'https://dns.google/dns-query',
    location: 'Global',
  },
];

export class DoHConfig {
  constructor() {
    this._enabled = true;
    this._mode = 'secure';
    this._providers = PROVIDERS;
    this._activeProvider = this._providers[0];
  }

  init() {
    this._applyPrefs();
  }

  _applyPrefs() {
    if (!this._enabled || this._mode === 'off') {
      lazy.Services.prefs.setIntPref("network.trr.mode", TRR_MODE.OFF);
      return;
    }
    const mode = this._mode === 'secure' ? TRR_MODE.ONLY : TRR_MODE.FALLBACK;
    lazy.Services.prefs.setIntPref("network.trr.mode", mode);
    lazy.Services.prefs.setCharPref("network.trr.uri", this._activeProvider.url);

    if (this._activeProvider.backup) {
      lazy.Services.prefs.setCharPref("network.trr.default_provider_uri", this._activeProvider.backup);
    }
    lazy.Services.prefs.setBoolPref("network.trr.wait-for-port", true);
    lazy.Services.prefs.setBoolPref("network.trr.allow-rfc1918", false);
  }

  getResolverUrl() {
    if (!this._enabled || this._mode === 'off') return null;
    return this._activeProvider.url;
  }

  getMode() { return this._mode; }

  setMode(mode) {
    if (['secure', 'fallback', 'off'].includes(mode)) {
      this._mode = mode;
      this._applyPrefs();
    }
  }

  setProvider(index) {
    if (index >= 0 && index < this._providers.length) {
      this._activeProvider = this._providers[index];
      this._dnsCache?.clear();
      this._applyPrefs();
    }
  }

  getProviders() {
    return this._providers.map((p, i) => ({ ...p, active: p === this._activeProvider }));
  }

  async resolve(domain, type = 'A') {
    if (!this._enabled || this._mode === 'off') return null;
    try {
      const dns = Cc["@mozilla.org/network/dns-service;1"].getService(Ci.nsIDNSService);
      const record = dns.resolve(domain, type === 'AAAA' ? Ci.nsIDNSService.RESOLVE_TYPE_AAAA : Ci.nsIDNSService.RESOLVE_TYPE_DEFAULT, 0);
      return {
        Addresses: record.getNextAddrAsString(),
        TTL: record.ttl,
      };
    } catch {
      return this._fetchFallback(domain, type);
    }
  }

  async _fetchFallback(domain, type) {
    const backup = this._activeProvider.backup || this._activeProvider.url;
    try {
      const url = new URL(backup);
      url.searchParams.set('name', domain);
      url.searchParams.set('type', type);
      const resp = await fetch(url.toString(), {
        headers: { 'Accept': 'application/dns-json' },
      });
      if (!resp.ok) return null;
      return resp.json();
    } catch { return null; }
  }

  getStatus() {
    return {
      enabled: this._enabled,
      mode: this._mode,
      provider: this._activeProvider.name,
      trrMode: lazy.Services.prefs.getIntPref("network.trr.mode"),
      trrUri: lazy.Services.prefs.getCharPref("network.trr.uri", ""),
    };
  }

  setEnabled(val) {
    this._enabled = val;
    this._applyPrefs();
  }
}
