/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { type } from 'os';

/**
 * @param domain The domain for the cookie to be valid for.
 * @param path The path for the cookie to be valid for.
 * @param expires The date/time after which the cookie is invalid (in milliseconds).
 * @param httpOnly Whether the cookie is only accessible through HTTP(S) requests.
 * @param sameSite Whether the cookie is only accessible through the same site. Can be 'Strict', 'Lax', or 'None'.
 * @param secure Whether the cookie is only accessible through HTTPS.
 * @param maxAge The maximum age (in seconds) of the cookie.
 * @example
 *
 * const cookieOptions: XSessionCookieOptions = {
 *   domain: 'localhost',
 *   path: '/',
 *   expires: 'Wed, 21 Oct 2020 07:28:00 GMT',
 *   httpOnly: true,
 *   sameSite: 'Strict',
 *   secure: true,
 *   maxAge: 3600,
 * };
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie/SameSite
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie/Secure
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie/HttpOnly
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie/Max-Age
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie/Expires
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie/Path
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie/Domain
 */
type XSessionCookieOptions = {
  domain: string;
  path: string;
  expires?: string;
  httpOnly?: boolean;
  sameSite?: string;
  secure?: boolean;
  maxAge?: number;
};

type XSessionCookie = {
  name: string;
  value: string;
  options?: XSessionCookieOptions;
};

const DefaultCookieOptions: XSessionCookieOptions = {
  domain: 'localhost',
  path: '/',
  expires: `${new Date(Date.now() + 3600 * 1000).toUTCString()}`,
  httpOnly: false,
  sameSite: 'Strict',
  secure: false,
  maxAge: 3600,
};

// for the SvelteKit event.cookies.get() and event.cookies.set()
type XSessioinCookiesHandler = {
  get: (key: string) => string | null;
  getAll: () => Record<string, string>;
  set: (key: string, value: string, options?: SetCookieOptions) => void;
  delete: (key: string, options?: DeleteCookieOptions) => void;
  serialize: (name: string, value: string, options?: SerializeOptions) => string;
};

interface SetCookieOptions {
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  maxAge?: number;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

interface DeleteCookieOptions {
  path?: string;
  domain?: string;
}

interface SerializeOptions {
  encode?: (value: string) => string;
  // Add any other options if they exist
}

/**
 * Get cookie options with the specified options.
 *
 * @param cookieOptions The cookie options to be set.
 * @example
 *
 * cookieOptions = getCookieOptions({ domain: 'localhost', path: '/', expires: 'Wed, 21 Oct 2020 07:28:00 GMT' });
 *
 */
const getCookieOptions = (
  cookieOptions: XSessionCookieOptions,
  setDefault?: boolean
): XSessionCookieOptions => {
  const options: XSessionCookieOptions | object = {};
  const cookieOptionKeys = [
    'domain',
    'path',
    'expires',
    'httpOnly',
    'sameSite',
    'secure',
    'maxAge',
  ];
  cookieOptionKeys.forEach((option: string) => {
    if (setDefault) {
      // @ts-ignore
      options[option] = cookieOptions[option] || DefaultCookieOptions[option];
    } else {
      // @ts-ignore
      options[option] = cookieOptions[option];
    }
  });
  return options as XSessionCookieOptions;
};

/**
 * Get cookie string to be set in the browser or to be sent to the server.
 *
 * @param cookie The cookie to be set.
 * @param cookieOptions The cookie options to be set.
 * @param setDefault Whether to set the default cookie options.
 * @example
 *
 * const cookieString = getCookieString(
 *   { name: 'x-session-data', value: '...' },
 *    getCookieOptions({ domain: 'localhost', path: '/', expires: 'Wed, 21 Oct 2020 07:28:00 GMT' })
 * );
 *
 */
const getCookieString = (
  cookie: XSessionCookie,
  cookieOptions?: XSessionCookieOptions,
  setDefault?: boolean
) => {
  let cookieString = `${cookie.name}=${cookie.value}; `;
  const domain =
    cookieOptions?.domain || cookie.options?.domain || setDefault
      ? DefaultCookieOptions.domain
      : false;
  const path =
    cookieOptions?.path || cookie.options?.path || setDefault ? DefaultCookieOptions.path : false;
  const expires =
    cookieOptions?.expires || cookie.options?.expires || setDefault
      ? DefaultCookieOptions.expires
      : false;
  const maxAge =
    cookieOptions?.maxAge || cookie.options?.maxAge || setDefault
      ? DefaultCookieOptions.maxAge
      : false;
  const sameSite =
    cookieOptions?.sameSite || cookie.options?.sameSite || setDefault
      ? DefaultCookieOptions.sameSite
      : false;
  const httpOnly =
    cookieOptions?.httpOnly || cookie.options?.httpOnly || setDefault
      ? DefaultCookieOptions.httpOnly
      : false;
  const secure =
    cookieOptions?.secure || cookie.options?.secure || setDefault
      ? DefaultCookieOptions.secure
      : false;
  if (domain) cookieString += `Domain=${domain}; `;
  if (path) cookieString += `Path=${path}; `;
  if (expires) cookieString += `Expires=${expires}; `;
  if (maxAge) cookieString += `Max-Age=${maxAge}; `;
  if (sameSite) cookieString += `SameSite=${sameSite}; `;
  if (secure) cookieString += `${secure ? 'Secure; ' : ''}`;
  if (httpOnly) cookieString += `${httpOnly ? 'HttpOnly; ' : ''}`;
  return cookieString;
};

const getCookie = (
  cookieName: string,
  _cookies?: XSessionCookie[] | XSessioinCookiesHandler
): string | null => {
  //
  let cookies = _cookies as XSessionCookie[];

  // if cookies is an object, it is the SvelteKit event.cookies
  _cookies = _cookies as XSessioinCookiesHandler;
  if (_cookies && typeof _cookies === 'object' && typeof _cookies.getAll === 'function') {
    cookies = _cookies.getAll() as any;
  }

  if (cookies && cookies.length > 0) {
    for (const cookie of cookies) {
      if (cookie.name === cookieName) {
        return decodeURIComponent(cookie.value);
      }
    }
    return null;
  } else if (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof document.cookie !== 'undefined'
  ) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [name, ...rest] = cookie.split('=');
      if (name === cookieName) {
        return decodeURIComponent(rest.join('='));
      }
    }
    return null;
  } else {
    return null;
  }
};

type XSessionNavInfo = {
  appCodeName: string;
  appName: string;
  appVersion: string;
  buildID: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  deviceMemory: number;
  hardwareConcurrency: number;
  language: string;
  languages: [];
  maxTouchPoints: number;
  onLine: boolean;
  oscpu: string;
  platform: string;
  plugins: [];
  product: string;
  productSub: string;
  userAgent: string;
  vendor: string;
  vendorSub: string;
  webdriver: boolean;
  windowScreen: {
    height: number;
    width: number;
  };
  windowLocation: {
    host: string;
    hostname: string;
    href: string;
    origin: string;
    pathname: string;
    port: string;
    protocol: string;
    search: string;
  };
};

const getNavigationInfo = () => {
  const nav = window.navigator;
  const scr = window.screen;
  const loc = window.location;
  const navInfo: XSessionNavInfo = {
    appCodeName: nav.appCodeName,
    appName: nav.appName,
    appVersion: nav.appVersion,
    buildID: nav.buildID,
    cookieEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack,
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
    language: nav.language,
    languages: nav.languages,
    maxTouchPoints: nav.maxTouchPoints,
    onLine: nav.onLine,
    oscpu: nav.oscpu,
    platform: nav.platform,
    plugins: [],
    product: nav.product,
    productSub: nav.productSub,
    userAgent: nav.userAgent,
    vendor: nav.vendor,
    vendorSub: nav.vendorSub,
    webdriver: nav.webdriver,
    windowScreen: {
      height: scr.height,
      width: scr.width,
    },
    windowLocation: {
      host: loc.host,
      hostname: loc.hostname,
      href: loc.href,
      origin: loc.origin,
      pathname: loc.pathname,
      port: loc.port,
      protocol: loc.protocol,
      search: loc.search,
    },
  };

  if (typeof nav.plugins !== 'undefined') {
    for (let i = 0; i < nav.plugins.length; i++) {
      navInfo.plugins.push(nav.plugins[i].name);
    }
  }

  navInfo.pdfViewerEnabled =
    typeof nav.mimeTypes !== 'undefined' &&
    typeof nav.mimeTypes['application/pdf'] !== 'undefined' &&
    nav.mimeTypes['application/pdf'].enabledPlugin !== null;

  return navInfo;
};

const getDomainFromUrl = (url: string) => {
  const urlObj = new URL(url);
  const fullDomain = urlObj.hostname;
  const domainParts = fullDomain.split('.');

  // If there are at least 2 parts in the domain (e.g. 'test' and 'net')
  if (domainParts.length >= 2) {
    // Get the last two parts of the domain
    return domainParts.slice(-2).join('.'); // 'test.net'
  } else {
    return fullDomain; // return the original domain (in case it doesn't have a subdomain)
  }
};

const InitXSessionDomElements = () => {
  if (typeof document === 'undefined') return;
  if (typeof window === 'undefined') return;
  // Style the page
  const style = document.createElement('style');
  let styleText = ':-webkit-full-screen { background-color: #303030; } \n'; // Chrome, Safari and Opera syntax
  styleText += ':-moz-full-screen { background-color: #303030; } \n'; // Firefox syntax
  styleText += ':-ms-fullscreen { background-color: #303030; } \n'; // IE11 or Edge syntax
  styleText += ':fullscreen { background-color: #303030; } \n'; // Standard syntax
  styleText += 'button { padding: 20px; font-size: 20px; } \n'; // Style the button
  style.textContent = styleText;
  document.head.appendChild(style);

  // Create xsession object
  window.xsession = window.xsession || {};

  // Fullscreen functions
  const elem = document.documentElement;
  window.xsession.openFullscreen = () => {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen(); // Safari
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen(); // IE11 or Edge
    }
  };

  window.xsession.closeFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen(); // Safari
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen(); // IE11 or Edge
    }
  };

  // Add event listeners
  document
    .getElementById('xsession$$OpenFullscreen')
    ?.addEventListener('click', window.xsession.openFullscreen);
  document
    .getElementById('xsession$$closeFullscreen')
    ?.addEventListener('click', window.xsession.closeFullscreen);

  // You can call the function on DOMContentLoaded or wherever it suits your needs
  document.addEventListener('DOMContentLoaded', function () {
    setMetaTags();
  });
};

function enableFullscreen() {
  // Set the viewport properties
  var meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
  document.getElementsByTagName('head')[0].appendChild(meta);

  // Set the body styles
  document.body.style.margin = '0';
  document.body.style.height = '100vh';
  document.body.style.overflow = 'hidden';

  // Scroll a bit to hide the address bar
  window.scrollTo(0, 1);

  // Add a listener to resize events to maintain fullscreen
  window.addEventListener('resize', function () {
    window.scrollTo(0, 1);
  });
}

function setMetaTags() {
  var viewport = document.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.getElementsByTagName('head')[0].appendChild(viewport);

  var appleWebAppCapable = document.createElement('meta');
  appleWebAppCapable.name = 'apple-mobile-web-app-capable';
  appleWebAppCapable.content = 'yes';
  document.getElementsByTagName('head')[0].appendChild(appleWebAppCapable);

  var appleStatusBarStyle = document.createElement('meta');
  appleStatusBarStyle.name = 'apple-mobile-web-app-status-bar-style';
  appleStatusBarStyle.content = 'black-translucent';
  document.getElementsByTagName('head')[0].appendChild(appleStatusBarStyle);
}

export type { XSessionCookieOptions, XSessionCookie, XSessionNavInfo };
export type { XSessioinCookiesHandler, SetCookieOptions, DeleteCookieOptions, SerializeOptions };
export { getCookieOptions, getCookieString, getCookie };
export { getNavigationInfo, getDomainFromUrl };
