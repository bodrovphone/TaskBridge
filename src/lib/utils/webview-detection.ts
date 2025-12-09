/**
 * WebView Detection Utility
 *
 * Detects if the app is running inside an in-app browser (WebView)
 * like Telegram, Facebook, Instagram, etc.
 *
 * This is important because:
 * - Google OAuth is BLOCKED in WebViews for security reasons
 * - Facebook OAuth may also have issues in some WebViews
 * - We need to show alternative auth methods or prompt users to open in system browser
 */

export interface WebViewInfo {
  isWebView: boolean
  platform: 'telegram' | 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'other' | null
  canOpenInBrowser: boolean
}

/**
 * Detect if running in a WebView (in-app browser)
 *
 * @returns WebViewInfo with detection results
 */
export function detectWebView(): WebViewInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isWebView: false, platform: null, canOpenInBrowser: false }
  }

  const ua = navigator.userAgent || ''
  const uaLower = ua.toLowerCase()

  // Telegram WebView detection
  if (uaLower.includes('telegram') || uaLower.includes('tgweb')) {
    return { isWebView: true, platform: 'telegram', canOpenInBrowser: true }
  }

  // Facebook WebView detection (FBAN = Facebook App Name, FBAV = Facebook App Version)
  if (ua.includes('FBAN') || ua.includes('FBAV') || uaLower.includes('fb_iab')) {
    return { isWebView: true, platform: 'facebook', canOpenInBrowser: true }
  }

  // Instagram WebView detection
  if (uaLower.includes('instagram')) {
    return { isWebView: true, platform: 'instagram', canOpenInBrowser: true }
  }

  // Twitter/X WebView detection
  if (uaLower.includes('twitter') || ua.includes('TwitterAndroid')) {
    return { isWebView: true, platform: 'twitter', canOpenInBrowser: true }
  }

  // LinkedIn WebView detection
  if (uaLower.includes('linkedin')) {
    return { isWebView: true, platform: 'linkedin', canOpenInBrowser: true }
  }

  // Generic Android WebView detection
  if (ua.includes('wv') && ua.includes('Android')) {
    return { isWebView: true, platform: 'other', canOpenInBrowser: true }
  }

  // iOS WebView detection (WKWebView doesn't always have clear indicators)
  // Check for missing Safari but having AppleWebKit
  if (
    ua.includes('AppleWebKit') &&
    !ua.includes('Safari') &&
    (ua.includes('iPhone') || ua.includes('iPad'))
  ) {
    return { isWebView: true, platform: 'other', canOpenInBrowser: true }
  }

  return { isWebView: false, platform: null, canOpenInBrowser: false }
}

/**
 * Check if Google OAuth is supported in current browser
 * Google blocks OAuth in WebViews for security reasons
 */
export function isGoogleOAuthSupported(): boolean {
  const { isWebView } = detectWebView()
  return !isWebView
}

/**
 * Check if Facebook OAuth is supported in current browser
 * Facebook OAuth may have issues in some WebViews
 */
export function isFacebookOAuthSupported(): boolean {
  const { isWebView, platform } = detectWebView()
  // Facebook OAuth works in Facebook's own WebView but not others
  if (isWebView && platform !== 'facebook') {
    return false
  }
  return true
}

/**
 * Get the current page URL for "Open in Browser" functionality
 */
export function getCurrentUrl(): string {
  if (typeof window === 'undefined') return ''
  return window.location.href
}

/**
 * Attempt to open current page in system browser
 * Different platforms have different methods
 */
export function openInSystemBrowser(): void {
  if (typeof window === 'undefined') return

  const url = getCurrentUrl()
  const { platform } = detectWebView()

  // For most WebViews, window.open with _system or _blank can trigger system browser
  // Some platforms may ignore this, but it's the best cross-platform approach

  if (platform === 'telegram') {
    // Telegram WebView: Use special URL scheme or just copy to clipboard as fallback
    // window.open usually works in Telegram
    window.open(url, '_blank')
  } else {
    // Generic approach
    window.open(url, '_system') || window.open(url, '_blank')
  }
}

/**
 * Get user-friendly name for the detected platform
 */
export function getPlatformName(platform: WebViewInfo['platform']): string {
  switch (platform) {
    case 'telegram': return 'Telegram'
    case 'facebook': return 'Facebook'
    case 'instagram': return 'Instagram'
    case 'twitter': return 'Twitter/X'
    case 'linkedin': return 'LinkedIn'
    case 'other': return 'this app'
    default: return 'the app'
  }
}
