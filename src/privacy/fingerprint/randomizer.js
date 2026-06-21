const lazy = {};
ChromeUtils.defineESModuleGetters(lazy, {
  Services: "resource://gre/modules/Services.sys.mjs",
});

const Ci = Components.interfaces;

export class FingerprintRandomizer {
  constructor() {
    this._fingerprints = new Map();
    this._enabled = true;
  }

  init() {
    this._applyPrefs();
    this._registerObserver();
  }

  _applyPrefs() {
    if (this._enabled) {
      lazy.Services.prefs.setBoolPref("privacy.resistFingerprinting", true);
      lazy.Services.prefs.setBoolPref("privacy.fingerprintingProtection", true);
      lazy.Services.prefs.setBoolPref("privacy.spoof_english", true);
      lazy.Services.prefs.setIntPref("privacy.window.maxInnerWidth", 2560);
      lazy.Services.prefs.setIntPref("privacy.window.maxInnerHeight", 1440);
    }
  }

  _registerObserver() {
    lazy.Services.obs.addObserver(this, "http-on-modify-request");
    lazy.Services.obs.addObserver(this, "user-agent-override");
  }

  observe(subject, topic, data) {
    if (topic === "http-on-modify-request" && subject instanceof Ci.nsIHttpChannel) {
      this._applyPerDomainFingerprint(subject);
    }
  }

  _applyPerDomainFingerprint(channel) {
    const URI = channel.URI;
    const host = URI.host;
    const fp = this.getForDomain(host);
    if (!fp) return;

    const ua = fp.userAgent;
    if (ua) {
      channel.setRequestHeader("User-Agent", ua, false);
    }
  }

  getForDomain(domain) {
    if (!this._enabled) return null;
    if (!this._fingerprints.has(domain)) {
      this._fingerprints.set(domain, this._generateFingerprint());
    }
    return this._fingerprints.get(domain);
  }

  _generateFingerprint() {
    return {
      userAgent: this._randomUserAgent(),
      screen: this._randomScreen(),
      timezone: this._randomTimezone(),
      canvas: this._randomCanvasNoise(),
      fonts: this._randomFonts(),
      hardware: this._randomHardware(),
    };
  }

  _randomUserAgent() {
    const browsers = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0',
    ];
    return browsers[Math.floor(Math.random() * browsers.length)];
  }

  _randomScreen() {
    const screens = [
      { width: 1920, height: 1080, colorDepth: 24, pixelRatio: 1 },
      { width: 2560, height: 1440, colorDepth: 24, pixelRatio: 1.25 },
      { width: 1366, height: 768, colorDepth: 24, pixelRatio: 1 },
      { width: 3840, height: 2160, colorDepth: 24, pixelRatio: 1.5 },
    ];
    return screens[Math.floor(Math.random() * screens.length)];
  }

  _randomTimezone() {
    const zones = [
      'Asia/Shanghai', 'Asia/Tokyo', 'America/New_York',
      'Europe/London', 'Asia/Singapore', 'Australia/Sydney',
      'Europe/Berlin', 'America/Los_Angeles',
    ];
    return zones[Math.floor(Math.random() * zones.length)];
  }

  _randomCanvasNoise() {
    return { amplitude: Math.random() * 0.001, frequency: Math.random() * 0.5 };
  }

  _randomFonts() {
    const sets = [
      ['Arial', 'Times New Roman', 'Segoe UI', 'Consolas'],
      ['Calibri', 'Verdana', 'Georgia', 'Courier New'],
      ['Segoe UI', 'Arial', 'Tahoma', 'Lucida Console'],
    ];
    return sets[Math.floor(Math.random() * sets.length)];
  }

  _randomHardware() {
    return {
      cpuCores: [4, 6, 8, 12, 16][Math.floor(Math.random() * 5)],
      memory: [4, 8, 16, 32, 64][Math.floor(Math.random() * 5)],
      deviceMemory: [4, 8, 16, 32][Math.floor(Math.random() * 4)],
    };
  }

  setEnabled(val) {
    this._enabled = val;
    lazy.Services.prefs.setBoolPref("privacy.resistFingerprinting", val);
    lazy.Services.prefs.setBoolPref("privacy.fingerprintingProtection", val);
  }

  resetSession() {
    this._fingerprints.clear();
  }
}
