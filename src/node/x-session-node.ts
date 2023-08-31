/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { XSessionCookieOptions, XSessionCookie, XSessionNavInfo } from './x-browser.js';
import { getCookieOptions, getCookieString, getCookie } from './x-browser.js';
import { getNavigationInfo, getDomainFromUrl } from './x-browser.js';
import XSessionPushEvent, { XSessionPushEventOptions } from './x-session-sse.js';

// import * as jwt from 'jsonwebtoken'; // for the node only
import { KJUR, KEYUTIL } from 'jsrsasign'; // for the browser

// Dynamic imports are only supported when the '--module' flag is set to
// - 'es2020', 'es2022', 'esnext', 'commonjs', 'amd', 'system', 'umd', 'node16', or 'nodenext'.
let _randomUUID: () => string;
// Detect if we're in Node.js
if (typeof window === null || typeof window === 'undefined') {
  // We're in Node.js
  import('node:crypto').then((crypto) => {
    _randomUUID = crypto.randomUUID;
  });
} else {
  // We're in the browser
  import('uuid').then((uuid) => {
    _randomUUID = uuid.v4;
  });
}
//
// Above code is not working in the browser:
// 1) [HMR][Svelte] Unrecoverable HMR error in <Root>: next update will trigger a full reload
// 2) x-session-browser.ts:101 Uncaught (in promise) TypeError: randomUUID is not a function
//    at XSession.createXSession (x-session-browser.ts:101:29)
//    at +layout.svelte:45:12
//
// or
//
// 1) TypeError: Cannot read property 'randomUUID' of undefined
//
// So, I have to use the following code instead(but let's keep and check the problems the above code for the future):
import { v4 as randomUUID } from 'uuid';

// fetch for the original node-fetch
import node_fetch from 'node-fetch';

type XSessionMessage = {
  msgType: string;
  msgData: any;
};

type XSessionHttpHeaders = { [key: string]: any } | Headers;

interface XSessionOptions extends XSessionPushEventOptions {
  apiKey?: string;
  clientIPAddress?: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS';
  headers?: XSessionHttpHeaders;
  cookies?: XSessionCookie[];
}

type XSessionCheckStatus =
  | 'x-new-session' // ns
  | 'x-enable-session' // en
  | 'x-expired-session' // ex
  | 'x-invalid-session' // in
  | 'x-unknown-session' // un
  | 'x-certified-session' // ce
  | 'x-empty-session'; // empty

type XSessionCookieData = {
  status: string;
  clientSessionId: string;
  sessionOptions: XSessionOptions;
  cookieOptions: XSessionCookieOptions | null;
  payload: XSessionNavInfo;
};

class XSession extends XSessionPushEvent {
  protected __CLASSNAME__ = 'XSession';

  private _isDisabledSession = true;
  private _sessionStatus: XSessionCheckStatus = 'x-empty-session';
  private _clientSessionId: string | null = null;
  private _sessionOptions: XSessionOptions;
  private _sessionOptionsVolatile: XSessionOptions | null = null;
  private _cookieOptions: XSessionCookieOptions | null = null;
  // @ts-ignore
  private _browserInfo: XSessionNavInfo = {};

  /**
   * @param options - The options for the XSession instance
   * @param cookieOptions - The options for the cookie
   * @example
   * ```js
   * const xsession = new XSession({ url: 'http://localhost:3000/events' }, {
   *     domain: 'localhost',
   *     path: '/',
   *     expires: 60 * 60 * 24 * 7, // 7 days
   *     httpOnly: false,
   *     sameSite: 'Strict',
   *     secure: false,
   *     maxAge: 60 * 60 * 24 * 7, // 7 days
   * });
   * ```
   */
  constructor(options: XSessionOptions, cookieOptions?: XSessionCookieOptions) {
    super(options);
    this._sessionOptions = options;
    this._sessionOptions.headers = this.getHttpHeaders(options.headers || new Headers());
    this._cookieOptions = cookieOptions || null;
  }

  private isBrowser(): boolean {
    if (typeof window === null || typeof window === 'undefined') {
      return false;
    }
    if (typeof document === null || typeof document === 'undefined') {
      return false;
    }
    if (typeof document?.cookie === null || typeof document?.cookie === 'undefined') {
      return false;
    }
    if (typeof window?.navigator === null || typeof window?.navigator === 'undefined') {
      return false;
    }
    if (
      typeof window?.navigator?.userAgent === null ||
      typeof window?.navigator?.userAgent === 'undefined'
    ) {
      return false;
    }
    return true;
  }

  private getCookie(cookieName: string): string | null {
    if (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined' &&
      typeof document.cookie !== 'undefined'
    ) {
      return getCookie(cookieName);
    } else {
      if (this._sessionOptionsVolatile?.cookies) {
        return getCookie(cookieName, this._sessionOptionsVolatile?.cookies);
      } else if (this._sessionOptions.cookies) {
        return getCookie(cookieName, this._sessionOptions.cookies);
      }
      return null;
    }
  }

  private getHttpHeaders(headers: XSessionHttpHeaders): Headers {
    const __FUNCTION__ = 'getHttpHeaders()';

    let httpHeaders = new Headers();
    if (headers === null || headers === undefined) {
      return httpHeaders;
    }
    if (headers && headers.constructor.name === 'Headers') {
      httpHeaders = headers as Headers;
    } else if (headers && headers.constructor.name === 'Object') {
      // 'Object' {...}
      Object.entries(headers).forEach(([key, value]) => {
        httpHeaders.append(key, value);
      });
    } else {
      throw new Error(
        `${this.__CLASSNAME__}::${__FUNCTION__} 'headers' in the param is not valid. It must be an instance of 'Headers' or 'Object'`
      );
    }
    return httpHeaders;
  }

  public createXSession(): XSession {
    // Check checkXSession() and isDisabled() chain or new XSession() instance
    if (!this._isDisabledSession) {
      // Initialize checkXSession() and isDisabled() chain
      this._isDisabledSession = true;
      return this;
    }

    // Load the browser information
    this._browserInfo = getNavigationInfo();

    // Create a new client session ID
    this._clientSessionId = randomUUID();

    // Set cookie the browser information encrypted with specific algorithm
    const cookieValue: XSessionCookieData = {
      status: 'x-new-session',
      clientSessionId: this._clientSessionId,
      sessionOptions: this._sessionOptions,
      cookieOptions: this._cookieOptions,
      payload: this._browserInfo,
    };
    const domainOrigin = getDomainFromUrl(this._browserInfo.windowLocation?.origin || 'localhost');

    document.cookie = getCookieString(
      { name: 'x-session-data', value: this.getJsonWebToken(cookieValue) },
      this._cookieOptions
        ? getCookieOptions({
            domain: this._cookieOptions.domain || domainOrigin,
            path: this._cookieOptions.path || '/',
            expires: this._cookieOptions.expires || undefined,
            httpOnly: this._cookieOptions.httpOnly || false,
            sameSite: this._cookieOptions.sameSite || 'Strict',
            secure: this._cookieOptions.secure || false,
            maxAge: this._cookieOptions.maxAge || undefined,
          })
        : getCookieOptions({
            domain: domainOrigin,
            path: '/',
            sameSite: 'Strict',
            httpOnly: false,
            secure: false,
          })
    );
    return this;
  }

  public get getClientSessionId(): string | undefined {
    if (
      this._clientSessionId === null ||
      this._clientSessionId === undefined ||
      this._browserInfo.windowLocation?.origin === null ||
      this._browserInfo.windowLocation?.origin === undefined
    ) {
      const cookieData = this.getCookie('x-session-data');
      if (
        cookieData === null ||
        cookieData === undefined ||
        cookieData === '' ||
        cookieData.length < 256
      ) {
        return undefined;
      }
      const xSessionData = this.getSessionData(cookieData) as XSessionCookieData;
      if (xSessionData === null || xSessionData === undefined) {
        return undefined;
      }
      this._clientSessionId = xSessionData.clientSessionId || null;
      this._sessionOptions = xSessionData.sessionOptions;
      this._cookieOptions = xSessionData.cookieOptions;
      this._browserInfo = xSessionData.payload;
      if (this._clientSessionId === null) {
        return undefined;
      }
      return this._clientSessionId;
    }
    return this._clientSessionId;
  }

  public checkXSession(): XSession {
    const xSessionData = this.getCookie('x-session-data');
    const cookieIV = xSessionData?.slice(0, 2) || '';
    switch (cookieIV) {
      case 'ns':
        this._isDisabledSession = false;
        this._sessionStatus = 'x-new-session';
        break;
      case 'en':
        this._isDisabledSession = false;
        this._sessionStatus = 'x-enable-session';
        break;
      case 'ex':
        this._isDisabledSession = true;
        this._sessionStatus = 'x-expired-session';
        break;
      case 'in':
        this._isDisabledSession = true;
        this._sessionStatus = 'x-invalid-session';
        break;
      case 'un':
        this._isDisabledSession = true;
        this._sessionStatus = 'x-unknown-session';
        break;
      case 'ce':
        this._isDisabledSession = false;
        this._sessionStatus = 'x-certified-session';
        break;
      default:
        this._isDisabledSession = true;
        this._sessionStatus = 'x-empty-session';
        break;
    }
    return this;
  }

  public isDisabled(): XSession {
    let isDisabled = true;
    switch (this._sessionStatus) {
      case 'x-new-session':
      case 'x-enable-session':
      case 'x-certified-session':
        isDisabled = false;
        break;
      case 'x-expired-session':
      case 'x-invalid-session':
      case 'x-unknown-session':
      case 'x-empty-session':
      default:
        isDisabled = true;
        break;
    }
    this._isDisabledSession = isDisabled;
    return this;
  }

  private getJsonWebToken(payload: object) {
    /* for the node only
    const token = jwt.sign({ data: payload }, 'x-new-session', { algorithm: 'HS256' });
    */
    // for the node and browser
    const token = KJUR.jws.JWS.sign(null, { alg: 'HS256' }, payload, { utf8: 'x-new-session' });
    return `ns${token}`;
  }

  private getSessionData(token: string) {
    const __FUNCTION__ = 'getSessionData()';
    /* for the node only
    try {
      const decoded = jwt.verify(token, 'x-new-session', { algorithms: ['HS256'] });
      console.log(decoded.data); // This will print the original payload
    } catch (err) {
      console.error('Token verification failed:', err);
    }
    */
    // for the node and browser
    const isValid = KJUR.jws.JWS.verify(token.slice(2, token.length), { utf8: 'x-new-session' }, [
      'HS256',
    ]);
    if (isValid) {
      const parsedToken = KJUR.jws.JWS.parse(token.slice(2, token.length));
      return parsedToken.payloadObj;
    } else {
      console.error(
        `${this.__CLASSNAME__}::${__FUNCTION__} Token verification failed. Invalid token: ${token}`
      );
    }
    return null;
  }

  private isSameOrigin(xssRequestTarget: string) {
    const __CLASSNAME__ = this.__CLASSNAME__;
    const __FUNCTION__ = 'isSameOrigin()';
    let xssRequestOrigin = this._browserInfo.windowLocation?.origin || null;
    if (!xssRequestOrigin) {
      if (this._sessionOptions.msgDebug) {
        console.log(
          `${__CLASSNAME__}: Cross-site scripting(XSS), cross-site request forgery(CSRF) check ... x-session-client: ${this.getClientSessionId}`
        );
      } else {
        this.getClientSessionId;
      }
      xssRequestOrigin = this._browserInfo.windowLocation?.origin || null;
      if (!xssRequestOrigin) {
        console.error(
          `${__CLASSNAME__}::${__FUNCTION__} xssRequestOrigin is null! 👎 You must check createXSession() has been initialized properly before calling send() !!!`
        );
        return false;
      }
    }
    try {
      const urlOrigin = new URL(xssRequestOrigin);
      const urlTarget = new URL(xssRequestTarget);
      return (
        urlOrigin.protocol === urlTarget.protocol &&
        urlOrigin.hostname === urlTarget.hostname &&
        urlOrigin.port === urlTarget.port
      );
    } catch (error) {
      console.error(
        `${__CLASSNAME__}::${__FUNCTION__} cross-site request check failed! 👎 error:`,
        error
      );
      return false;
    }
  }

  public config(options: XSessionOptions): XSession {
    options.headers = this.getHttpHeaders(options.headers || new Headers());
    const headersInVolatile = this._sessionOptionsVolatile?.headers || null;
    if (!this._sessionOptionsVolatile) {
      this._sessionOptionsVolatile = { ...this._sessionOptions };
    }
    // Merge options into _sessionOptionsVolatile, overwriting existing properties
    Object.assign(this._sessionOptionsVolatile, options);
    if (headersInVolatile) return this.setHeaders(headersInVolatile);
    return this;
  }

  public setHeaders(headers: XSessionHttpHeaders): XSession {
    const httpHeaders = this.getHttpHeaders(headers || new Headers());
    if (!this._sessionOptionsVolatile) {
      this._sessionOptionsVolatile = { ...this._sessionOptions };
    }
    httpHeaders.forEach((value, key) => {
      this._sessionOptionsVolatile?.headers?.append(key, value);
    });
    if (!this._sessionOptionsVolatile?.headers?.has('Content-Type')) {
      this._sessionOptionsVolatile?.headers?.append('Content-Type', 'application/json');
    }
    return this;
  }

  public async send(msgTypeOrData: string | any, msgData?: any): Promise<XSessionMessage> {
    const __CLASSNAME__ = this.__CLASSNAME__;
    const __FUNCTION__ = 'send()';
    if (!this._sessionOptionsVolatile) {
      /*
      throw new Error(
        `${this.__CLASSNAME__}::${__FUNCTION__} The session configuration is not set yet. call config() method first before send().`
      );
      */
      this._sessionOptionsVolatile = { ...this._sessionOptions };
    }
    const _msgType = typeof msgTypeOrData === 'string' ? msgTypeOrData : 'message';
    const _msgData = typeof msgTypeOrData === 'string' ? msgData : msgTypeOrData;
    const url = this._sessionOptionsVolatile.url || this._sessionOptions.url || 'localhost';
    const method = this._sessionOptionsVolatile.method || 'POST';
    const headers =
      [...this._sessionOptionsVolatile.headers?.entries()].length > 0
        ? this._sessionOptionsVolatile.headers
        : new Headers({ 'Content-Type': 'application/json' });
    const apiKey = this._sessionOptionsVolatile.apiKey || '';
    const sessionId = this._clientSessionId || '';
    const clientIPAddress = this._sessionOptionsVolatile.clientIPAddress || '';
    try {
      if (apiKey && apiKey.length > 0) {
        headers?.append('x-session-key', apiKey);
      }
      if (sessionId && sessionId.length > 0) {
        headers?.append('x-session-client', sessionId);
      }
      if (clientIPAddress && clientIPAddress.length > 0) {
        headers?.append('x-session-ip', clientIPAddress);
      }
      if (!this.isSameOrigin(url) || !this.isBrowser()) {
        let xsessionCookie = null;
        const xsessionData = this.getCookie('x-session-data');
        const xsessionToken = this.getCookie('x-session-token');
        const xsessionId = this.getCookie('x-session-id');
        if (xsessionData && xsessionData.length > 0) {
          xsessionCookie = `x-session-data=${xsessionData}`;
          if (xsessionToken && xsessionToken.length > 0) {
            xsessionCookie += `; x-session-token=${xsessionToken}`;
          }
          if (xsessionId && xsessionId.length > 0) {
            xsessionCookie += `; x-session-id=${xsessionId}`;
          }
          headers?.append('x-session-cookie', xsessionCookie);
        }
      }
    } catch (error) {
      // After set the headers and before returning, reset the volatile options
      this._sessionOptionsVolatile = null;
      throw new Error(
        `${this.__CLASSNAME__}::${__FUNCTION__} Error on appending http headers! 👎 error msg: ${error}`
      );
    }
    // After set the headers and before returning, reset the volatile options
    this._sessionOptionsVolatile = null;
    return await new Promise(async (resolve, reject): Promise<XSessionMessage> => {
      try {
        const res = await node_fetch(url, {
          method: method,
          headers: headers,
          body: JSON.stringify({
            msgType: _msgType,
            msgData: _msgData,
          }),
        })
          // @ts-ignore @ts-nocheck
          .then(async (response: Response) => {
            const jsonData = await response.json();
            if (jsonData.msgType === null || jsonData.msgType === undefined) {
              throw new Error(
                `${__CLASSNAME__}::${__FUNCTION__} Invalid response from the server. Can not find 'msgType' property in the response.`
              );
            }
            if (jsonData.msgData === null || jsonData.msgData === undefined) {
              throw new Error(
                `${__CLASSNAME__}::${__FUNCTION__} Invalid response from the server. Can not find 'msgData' property in the response.`
              );
            }
            resolve(jsonData as XSessionMessage);
          })
          .catch((error: any) => {
            console.error(
              `${__CLASSNAME__}::${__FUNCTION__} fetch error catched! 👎 error msg:`,
              error ? error.message : 'unknown',
              error
            );
            reject(error);
          });
      } catch (error) {
        console.error(
          `${__CLASSNAME__}::${__FUNCTION__} fetch try/catch catched! 👎 error:`,
          error
        );
        reject(error);
      }
      // The flow will never reach here, but just in case, return the following
      const statusMessage = `${__CLASSNAME__}::${__FUNCTION__}: Internal Server Error (This is a fallback message, it's crucial, patch the bugs and update to the latest version! :))`;
      return {
        msgType: _msgType,
        msgData: {
          statusCode: 500,
          statusMessage: statusMessage,
          data: {
            error: statusMessage,
            ..._msgData,
          },
        },
      };
    });
  }
}

export type { XSessionOptions, XSessionCookieOptions, XSessionCookieData, XSessionMessage };
export default XSession;

/*
//
//
//
//
// Check x-session availability
// ...
// Below is an example of how to use cookies to control with e-session
const browserInfo = cookies.get('browserInfo');
console.debug('browserInfo:', browserInfo);
// If x-session is available, then call the API endpoint to get the user session data
if (browserInfo) {
  // Do something here
  // ...
  let userSessionData = undefined; // Get the user session data from the API endpoint
  const sessionid = cookies.get('x-session-id');
  if (sessionid) {
    // fetch data from an API
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-session-id': sessionid,
      },
    });
    if (res.status === 200) {
      userSessionData = await res.json();
    }
  }
  return {
    xsession: true, // This is a flag to indicate that x-session is available
    userSessionData: userSessionData,
  };
} else {
  // If x-session is not available, then return to the +layout.svelte page to set up x-session from the client side
  return { xsession: false };
}

*/
