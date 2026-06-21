/* ===========================================================
   XFBrowser - 浏览器指纹随机伪装模块
   每会话 / 每域名生成随机指纹，防止跨站追踪
   纯 ES Module
   =========================================================== */

export class FingerprintRandomizer {
  constructor() {
    this._fingerprints = new Map();
    this._enabled = true;
  }

  /** 获取当前域名的伪装指纹 */
  getForDomain(domain) {
    if (!this._enabled) return null;
    if (!this._fingerprints.has(domain)) {
      this._fingerprints.set(domain, this._generateFingerprint());
    }
    return this._fingerprints.get(domain);
  }

  /** 生成随机指纹 */
  _generateFingerprint() {
    return {
      userAgent: this._randomUserAgent(),
      screen: this._randomScreen(),
      timezone: this._randomTimezone(),
      canvas: this._randomCanvasNoise(),
      fonts: this._randomFonts(),
      hardware: this._randomHardware()
    };
  }

  /** 随机 UA */
  _randomUserAgent() {
    const browsers = [
      // Chrome 128 on Windows 11
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      // Chrome 127 on Windows 11
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      // Chrome 128 on Windows 10
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    ];
    return browsers[Math.floor(Math.random() * browsers.length)];
  }

  /** 随机屏幕参数 */
  _randomScreen() {
    const screens = [
      { width: 1920, height: 1080, colorDepth: 24, pixelRatio: 1 },
      { width: 2560, height: 1440, colorDepth: 24, pixelRatio: 1.25 },
      { width: 1366, height: 768, colorDepth: 24, pixelRatio: 1 },
      { width: 3840, height: 2160, colorDepth: 24, pixelRatio: 1.5 },
      { width: 1920, height: 1200, colorDepth: 24, pixelRatio: 1 },
    ];
    return screens[Math.floor(Math.random() * screens.length)];
  }

  /** 随机时区 */
  _randomTimezone() {
    const timezones = [
      'Asia/Shanghai', 'Asia/Tokyo', 'America/New_York',
      'Europe/London', 'Asia/Singapore', 'Australia/Sydney',
      'Europe/Berlin', 'America/Los_Angeles'
    ];
    return timezones[Math.floor(Math.random() * timezones.length)];
  }

  /** Canvas 噪声参数 */
  _randomCanvasNoise() {
    return {
      amplitude: Math.random() * 0.001,
      frequency: Math.random() * 0.5
    };
  }

  /** 随机字体列表 */
  _randomFonts() {
    const fontSets = [
      ['Arial', 'Times New Roman', 'Segoe UI', 'Consolas'],
      ['Calibri', 'Verdana', 'Georgia', 'Courier New'],
      ['Segoe UI', 'Arial', 'Tahoma', 'Lucida Console'],
    ];
    return fontSets[Math.floor(Math.random() * fontSets.length)];
  }

  /** 随机硬件参数 */
  _randomHardware() {
    return {
      cpuCores: [4, 6, 8, 12, 16][Math.floor(Math.random() * 5)],
      memory: [4, 8, 16, 32, 64][Math.floor(Math.random() * 5)],
      deviceMemory: [4, 8, 16, 32][Math.floor(Math.random() * 4)],
    };
  }

  /** 启用/禁用 */
  setEnabled(val) {
    this._enabled = val;
  }

  /** 清除当前会话指纹（下次访问重新生成） */
  resetSession() {
    this._fingerprints.clear();
  }
}
