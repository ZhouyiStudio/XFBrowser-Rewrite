const lazy = {};
ChromeUtils.defineESModuleGetters(lazy, {
  Services: "resource://gre/modules/Services.sys.mjs",
});

const Cc = Components.classes;
const Ci = Components.interfaces;

export class CookieIsolation {
  constructor() {
    this._blockThirdParty = true;
    this._enabled = true;
    this._allowedDomains = new Set();
  }

  init() {
    this._registerObserver();
    this._applyPartitionPrefs();
  }

  _registerObserver() {
    lazy.Services.obs.addObserver(this, "cookie-changed");
    lazy.Services.obs.addObserver(this, "http-on-modify-request");
  }

  observe(subject, topic, data) {
    if (topic === "http-on-modify-request" && subject instanceof Ci.nsIHttpChannel) {
      this._onRequest(subject);
    }
  }

  _onRequest(channel) {
    if (!this._enabled) return;
    const loadInfo = channel.loadInfo;
    if (!loadInfo) return;
    const isThirdParty = loadInfo.isThirdPartyContextToTopWindow;
    if (isThirdParty && this._blockThirdParty) {
      const URI = channel.URI;
      const domain = URI.host;
      if (!this._allowedDomains.has(domain)) {
        channel.setRequestHeader("Cookie", "", false);
      }
    }
  }

  shouldAllowCookie(cookie, uri) {
    if (!this._enabled) return true;
    const isThirdParty = Services.cookies.isThirdParty(cookie, uri);
    if (isThirdParty && this._blockThirdParty && !this._allowedDomains.has(cookie.host)) {
      return false;
    }
    return true;
  }

  _applyPartitionPrefs() {
    lazy.Services.prefs.setIntPref("network.cookie.cookieBehavior", 5);
    lazy.Services.prefs.setBoolPref("privacy.partition.network_state", true);
    lazy.Services.prefs.setBoolPref("network.cookie.thirdparty.sessionOnly", true);
  }

  getStoragePartition(topLevelDomain, frameDomain) {
    return `partitioned:${topLevelDomain}:${frameDomain}`;
  }

  addAllowedDomain(domain) { this._allowedDomains.add(domain); }
  removeAllowedDomain(domain) { this._allowedDomains.delete(domain); }
  setBlockThirdParty(block) { this._blockThirdParty = block; }
  setEnabled(val) { this._enabled = val; }
}

export class TrackingProtection {
  constructor() {
    this._blockedTrackers = new Set();
    this._knownTrackers = new Set([
      'google-analytics.com', 'googletagmanager.com',
      'facebook.net', 'fbcdn.net', 'doubleclick.net',
      'adservice.google.com', 'amazon-adsystem.com',
      'ads.linkedin.com', 'bat.bing.com', 'snapchat.com',
      'pinterest.com', 'twitter.com/i/jot', 't.co',
      'redditstatic.com', 'quantserve.com', 'scorecardresearch.com',
      'outbrain.com', 'taboola.com', 'hotjar.com',
      'fullstory.com', 'clarity.ms', 'analytics.tiktok.com',
      'ads.yahoo.com', 'advertising.com',
    ]);
  }

  init() {
    lazy.Services.obs.addObserver(this, "tracking-protection-blocked");
  }

  observe(subject, topic, data) {
    if (topic === "tracking-protection-blocked") {
      const host = subject?.QueryInterface(Ci.nsIURI)?.host;
      if (host) {
        this._blockedTrackers.add(host);
        console.log(`[XFB TP] Blocked tracker: ${host}`);
      }
    }
  }

  isTracker(url) {
    for (const tracker of this._knownTrackers) {
      if (url.includes(tracker)) {
        this._blockedTrackers.add(tracker);
        return true;
      }
    }
    return false;
  }

  getBlockedTrackers() { return Array.from(this._blockedTrackers); }

  getStats() {
    return {
      total: this._blockedTrackers.size,
      trackers: Array.from(this._blockedTrackers),
    };
  }
}
