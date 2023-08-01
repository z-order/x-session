/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { XSessionCookieOptions, XSessionCookie, XSessionNavInfo } from './x-browser.js';
import { getCookieOptions, getCookieString } from './x-browser.js';
import { getNavigationInfo, getDomainFromUrl } from './x-browser.js';
import XSessionPushEvent, { XSessionPushEventOptions } from './sse-browser.js';

// import * as jwt from 'jsonwebtoken'; // for the node only
import { KJUR, KEYUTIL } from 'jsrsasign'; // for the browser

// Dynamic imports are only supported when the '--module' flag is set to
// - 'es2020', 'es2022', 'esnext', 'commonjs', 'amd', 'system', 'umd', 'node16', or 'nodenext'.
let randomUUID: () => string;
// Detect if we're in Node.js
if (typeof process !== 'undefined' && process.versions != null && process.versions.node != null) {
  // We're in Node.js
  import('node:crypto').then((crypto) => {
    randomUUID = crypto.randomUUID;
  });
} else {
  // We're in the browser
  import('uuid').then((uuid) => {
    randomUUID = uuid.v4;
  });
}

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
}

class XSession extends XSessionPushEvent {
  protected __CLASSNAME__ = 'XSession';

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

  public createXSession() {
    // Load the browser information
    this._browserInfo = getNavigationInfo();

    // Create a new client session ID
    this._clientSessionId = randomUUID();

    // Set cookie the browser information encrypted with specific algorithm
    const cookieValue = {
      status: 'new-session',
      clientSessionId: this._clientSessionId,
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
  }

  private getJsonWebToken(payload: object) {
    /* for the node only
    const token = jwt.sign({ data: payload }, 'new-session', { algorithm: 'HS256' });
    */
    // for the node and browser
    const token = KJUR.jws.JWS.sign(null, { alg: 'HS256' }, payload, { utf8: 'new-session' });
    return `ns${token}`;
  }

  public config(options: XSessionOptions): XSession {
    options.headers = this.getHttpHeaders(options.headers || new Headers());
    const headersInVolatile = this._sessionOptionsVolatile?.headers || null;
    if (!this._sessionOptionsVolatile) {
      this._sessionOptionsVolatile = new Object() as XSessionOptions;
      this._sessionOptionsVolatile = this._sessionOptions;
    }
    Object.entries(options).forEach(([key, value]) => {
      // @ts-ignore
      this._sessionOptionsVolatile[key] = value;
    });
    if (headersInVolatile) return this.setHeaders(headersInVolatile);
    return this;
  }

  public setHeaders(headers: XSessionHttpHeaders): XSession {
    const httpHeaders = this.getHttpHeaders(headers || new Headers());
    if (!this._sessionOptionsVolatile) {
      this._sessionOptionsVolatile = new Object() as XSessionOptions;
      this._sessionOptionsVolatile = this._sessionOptions;
    }
    httpHeaders.forEach(([key, value]) => {
      this._sessionOptionsVolatile?.headers?.append(key, value);
    });
    if (!this._sessionOptionsVolatile?.headers?.has('Content-Type')) {
      this._sessionOptionsVolatile?.headers?.append('Content-Type', 'application/json');
    }
    return this;
  }

  public async send(msgTypeOrData: string | any, msgData?: any): Promise<XSessionMessage> {
    const __FUNCTION__ = 'send()';
    if (!this._sessionOptionsVolatile) {
      throw new Error(
        `${this.__CLASSNAME__}::${__FUNCTION__} The session configuration is not set yet. call config() method first before send().`
      );
    }
    const _msgType = typeof msgTypeOrData === 'string' ? msgTypeOrData : 'message';
    const _msgData = typeof msgTypeOrData === 'string' ? msgData : msgTypeOrData;
    const url = this._sessionOptionsVolatile.url || this._sessionOptions.url || 'localhost';
    const method = this._sessionOptionsVolatile.method || 'GET';
    const headers = this._sessionOptionsVolatile.headers || new Headers();
    const apiKey = this._sessionOptionsVolatile.apiKey || '';
    const sessionId = this._clientSessionId || '';
    const clientIPAddress = this._sessionOptionsVolatile.clientIPAddress || '';
    headers.append('x-session-key', apiKey);
    headers.append('x-session-client', sessionId);
    headers.append('x-session-ip', clientIPAddress);
    // After set the headers and before returning, reset the volatile options
    this._sessionOptionsVolatile = null;
    return new Promise(async (resolve, reject): Promise<XSessionMessage> => {
      const resp = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify({
          msgType: _msgType,
          msgData: _msgData,
        }),
      })
        .then(function (response: any) {
          return response.data;
        })
        .catch(function (error: any) {
          reject(error);
        });
      return resp as XSessionMessage;
    });
  }
}

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
