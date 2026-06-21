/* ===========================================================
   XFBrowser - 内置广告拦截引擎
   基于 uBlock Origin 精简规则引擎
   纯 ES Module，无外部依赖
   =========================================================== */

export class AdBlockEngine {
  constructor() {
    this._networkFilters = [];
    this._cosmeticFilters = [];
    this._scriptletFilters = [];
    this._rulesLoaded = false;
    this._blockedCount = 0;
  }

  async init() {
    await this._loadDefaultRules();
    this._rulesLoaded = true;
    console.log(`[AdBlock] 规则已加载: ${this._networkFilters.length} 条网络规则`);
  }

  async _loadDefaultRules() {
    // 内置 EasyList 精简规则（仅核心域名）
    const builtinRules = [
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
      // 中国大陆常用广告域名
      '||cnzz.com^',
      '||cnzz.mmstat.com^',
      '||t.cn^',
      '||sogou.com^?ad=',
      '||pos.baidu.com^',
      '||cpro.baidustatic.com^',
      '||union.sina.com.cn^',
      '||pindao.huopin.com^',
      '||ads.sohu.com^',
      '||ads.qq.com^',
      '||gtimg.cn^',
      '||p.t.qq.com^',
      // 追踪分析
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

    for (const rule of builtinRules) {
      if (rule.startsWith('||')) {
        this._networkFilters.push(this._parseNetworkFilter(rule));
      }
    }
  }

  _parseNetworkFilter(rule) {
    // 简化规则解析: ||domain.com^
    const domain = rule.slice(2, -1);
    return new NetworkFilter(domain);
  }

  /** 判断请求是否应被拦截 */
  shouldBlock(request) {
    if (!this._rulesLoaded) return false;

    const url = request.url || '';
    const type = request.type || '';

    // 不拦截文档和首屏资源
    if (type === 'main_frame' || type === 'document') return false;

    for (const filter of this._networkFilters) {
      if (filter.matches(url)) {
        this._blockedCount++;
        return true;
      }
    }
    return false;
  }

  /** 返回已拦截数量 */
  getBlockedCount() {
    return this._blockedCount;
  }

  /** 添加自定义规则 */
  addRule(ruleStr) {
    if (ruleStr.startsWith('||')) {
      this._networkFilters.push(this._parseNetworkFilter(ruleStr));
    }
  }

  /** 获取所有规则 */
  getRules() {
    return this._networkFilters.map(f => f.toString());
  }
}

class NetworkFilter {
  constructor(domain) {
    this.domain = domain;
  }

  matches(url) {
    try {
      return url.includes(this.domain);
    } catch {
      return false;
    }
  }

  toString() {
    return `||${this.domain}^`;
  }
}
