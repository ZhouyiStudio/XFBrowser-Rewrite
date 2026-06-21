const lazy = {};
ChromeUtils.defineESModuleGetters(lazy, {
  Services: "resource://gre/modules/Services.sys.mjs",
});

const Cc = Components.classes;
const Ci = Components.interfaces;

export class AdBlockEngine {
  constructor() {
    this._networkFilters = [];
    this._cosmeticFilters = [];
    this._blockedCount = 0;
    this._policyRegistered = false;
  }

  async init() {
    await this._loadDefaultRules();
    this._registerContentPolicy();
    console.log(`[XFB AdBlock] Loaded ${this._networkFilters.length} rules`);
  }

  async _loadDefaultRules() {
    const rules = [
      '||doubleclick.net^',
      '||googleadservices.com^',
      '||googlesyndication.com^',
      '||googleadsserving.cn^',
      '||googletagmanager.com^',
      '||google-analytics.com^',
      '||googletagservices.com^',
      '||adservice.google.com^',
      '||pagead2.googlesyndication.com^',
      '||partner.googleadservices.com^',
      '||criteo.com^',
      '||criteo.net^',
      '||casalemedia.com^',
      '||adsrvr.org^',
      '||adsymptotic.com^',
      '||ads.pubmatic.com^',
      '||ads.rubiconproject.com^',
      '||adnxs.com^',
      '||amazon-adsystem.com^',
      '||scorecardresearch.com^',
      '||outbrain.com^',
      '||taboola.com^',
      '||exponential.com^',
      '||tribalfusion.com^',
      '||turn.com^',
      '||doubleverify.com^',
      '||moatads.com^',
      '||appnexus.com^',
      '||openx.net^',
      '||indexww.com^',
      '||bidswitch.net^',
      '||adform.net^',
      '||adition.com^',
      '||media.net^',
      '||sharethrough.com^',
      '||pubnative.net^',
      '||inmobi.com^',
      '||cnzz.com^',
      '||cnzz.mmstat.com^',
      '||t.cn^',
      '||pos.baidu.com^',
      '||cpro.baidustatic.com^',
      '||union.sina.com.cn^',
      '||pindao.huopin.com^',
      '||ads.sohu.com^',
      '||ads.qq.com^',
      '||gtimg.cn^',
      '||p.t.qq.com^',
      '||dpm.demdex.net^',
      '||piwik.org^',
      '||matomo.org^',
      '||hotjar.com^',
      '||fullstory.com^',
      '||crazyegg.com^',
      '||mouseflow.com^',
      '||luckyorange.com^',
      '||sessioncam.com^',
      '||clarity.ms^',
      '||bat.bing.com^',
      '||analytics.tiktok.com^',
    ];
    for (const r of rules) {
      if (r.startsWith('||')) {
        this._networkFilters.push(new NetworkFilter(r.slice(2, -1)));
      }
    }
  }

  _registerContentPolicy() {
    if (this._policyRegistered) return;
    const catMan = Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);
    const uuid = Services.uuid.generateUUID().toString();
    catMan.addCategoryEntry("content-policy", uuid, uuid, false, true);
    this._policyRegistered = true;
  }

  shouldBlock(request) {
    const url = request instanceof Ci.nsIURI ? request.spec : String(request.url || '');
    const type = request instanceof Ci.nsILoadInfo
      ? this._loadInfoTypeToString(request)
      : (request.type || '');
    if (type === 'document' || type === 'main_frame') return false;
    for (const f of this._networkFilters) {
      if (f.matches(url)) {
        this._blockedCount++;
        return true;
      }
    }
    return false;
  }

  _loadInfoTypeToString(loadInfo) {
    switch (loadInfo.externalContentPolicyType) {
      case Ci.nsIContentPolicy.TYPE_DOCUMENT: return 'document';
      case Ci.nsIContentPolicy.TYPE_SUBDOCUMENT: return 'sub_frame';
      case Ci.nsIContentPolicy.TYPE_SCRIPT: return 'script';
      case Ci.nsIContentPolicy.TYPE_IMAGE: return 'image';
      case Ci.nsIContentPolicy.TYPE_STYLESHEET: return 'stylesheet';
      case Ci.nsIContentPolicy.TYPE_OBJECT: return 'object';
      case Ci.nsIContentPolicy.TYPE_XMLHTTPREQUEST: return 'xmlhttprequest';
      case Ci.nsIContentPolicy.TYPE_FETCH: return 'fetch';
      case Ci.nsIContentPolicy.TYPE_FONT: return 'font';
      case Ci.nsIContentPolicy.TYPE_MEDIA: return 'media';
      case Ci.nsIContentPolicy.TYPE_WEBSOCKET: return 'websocket';
      case Ci.nsIContentPolicy.TYPE_WEB_MANIFEST: return 'manifest';
      default: return 'other';
    }
  }

  getBlockedCount() { return this._blockedCount; }

  addRule(ruleStr) {
    if (ruleStr.startsWith('||')) {
      this._networkFilters.push(new NetworkFilter(ruleStr.slice(2, -1)));
    }
  }

  getRules() {
    return this._networkFilters.map(f => `||${f.domain}^`);
  }
}

class NetworkFilter {
  constructor(domain) { this.domain = domain; }
  matches(url) { try { return url.includes(this.domain); } catch { return false; } }
}

export function createAdBlockPolicy(engine) {
  return {
    QueryInterface: ChromeUtils.generateQI([Ci.nsIContentPolicy]),
    shouldLoad(contentLocation, loadInfo, mimeTypeGuess) {
      return engine.shouldBlock(contentLocation)
        ? Ci.nsIContentPolicy.REJECT_REQUEST
        : Ci.nsIContentPolicy.ACCEPT;
    },
    shouldProcess(contentLocation, loadInfo, mimeTypeGuess) {
      return Ci.nsIContentPolicy.ACCEPT;
    },
  };
}
