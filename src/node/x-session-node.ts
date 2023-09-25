/* eslint-disable @typescript-eslint/ban-ts-comment */

import type {
  XSessionCookieOptions,
  XSessionCookie,
  XSessionNavInfo,
  XSessioinCookiesHandler,
} from './x-browser.js';
import { getCookieOptions, getCookieString, getCookie } from './x-browser.js';
import { getNavigationInfo, getDomainFromUrl } from './x-browser.js';
import XSessionPushEvent, { XSessionPushEventOptions } from './x-session-sse.js';
import util from 'util';

// import * as jwt from 'jsonwebtoken'; // for the node only
import { KJUR, KEYUTIL } from 'jsrsasign'; // for the browser

// Dynamic imports are only supported when the '--module' flag is set to
// - 'es2020', 'es2022', 'esnext', 'commonjs', 'amd', 'system', 'umd', 'node16', or 'nodenext'.
//
// let _randomUUID: () => string;
// // Detect if we're in Node.js
// if (typeof window === null || typeof window === 'undefined') {
//   // We're in Node.js
//   import('node:crypto').then((crypto) => {
//     _randomUUID = crypto.randomUUID;
//   });
// } else {
//   // We're in the browser
//   import('uuid').then((uuid) => {
//     _randomUUID = uuid.v4;
//   });
// }
//
// Above code is not working in the browser:
// 1) [HMR][Svelte] Unrecoverable HMR error in <Root>: next update will trigger a full reload
// 2) x-session-browser.ts:101 Uncaught (in promise) TypeError: randomUUID is not a function
//    at XSession.createXSession (x-session-browser.ts:101:29)
//    at +layout.svelte:45:12
// 3) [plugin:vite:resolve] Module "node:crypto" has been externalized for browser compatibility,
//    imported by "/.../node_modules/.pnpm/x-session@0.x.x/node_modules/x-session/dist/browser/mjs/x-session-browser.js".
//    See http://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
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
  cookies?: XSessionCookie[] | XSessioinCookiesHandler;
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

  public isCreatedXSession(cookies?: XSessionCookie[]): boolean {
    let cookieData = null;
    if (this.isBrowser()) {
      // CSR(Client side render) check, using document.cookie
      cookieData = getCookie('x-session-data');
    } else {
      // SSR(Sever side render) check, using 'cookies' parameter
      cookieData = getCookie('x-session-data', cookies || []);
    }
    if (
      cookieData === null ||
      cookieData === undefined ||
      cookieData === '' ||
      cookieData.length < 256
    ) {
      return false;
    }
    const xSessionData = this.getSessionData(cookieData) as XSessionCookieData;
    if (xSessionData === null || xSessionData === undefined) {
      return false;
    }
    const clientSessionId = xSessionData.clientSessionId || null;
    if (clientSessionId === null) {
      return false;
    }
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(clientSessionId);
  }

  public isAvailableAPIKey(cookies?: XSessionCookie[]): boolean {
    let cookieData = null;
    if (this.isBrowser()) {
      // CSR(Client side render) check, using document.cookie
      cookieData = getCookie('x-session-key');
    } else {
      // SSR(Sever side render) check, using 'cookies' parameter
      cookieData = getCookie('x-session-key', cookies || []);
    }
    if (
      cookieData === null ||
      cookieData === undefined ||
      cookieData === '' ||
      cookieData.length < 36 ||
      cookieData.length > 256 // encrypted key length
    ) {
      return false;
    }
    return true;
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
        const xsessionKey = this.getCookie('x-session-key');
        const xsessionToken = this.getCookie('x-session-token');
        const xsessionId = this.getCookie('x-session-id');
        if (xsessionData && xsessionData.length > 0) {
          xsessionCookie = `x-session-data=${xsessionData}`;
          if (xsessionKey && xsessionKey.length > 0) {
            xsessionCookie += `; x-session-key=${xsessionKey}`;
          }
          if (xsessionId && xsessionId.length > 0) {
            xsessionCookie += `; x-session-id=${xsessionId}`;
          }
          if (xsessionToken && xsessionToken.length > 0) {
            xsessionCookie += `; x-session-token=${xsessionToken}`;
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
    // Before reset the volatile options, save the cookies for the SvelteKit event.cookies to send to the browser
    const cookiesObjectInSvelteKit = this._sessionOptionsVolatile?.cookies || null;
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
            // SvleteKit event.cookies to send cookies from the server to the browser
            if (
              cookiesObjectInSvelteKit !== null &&
              cookiesObjectInSvelteKit !== undefined &&
              typeof cookiesObjectInSvelteKit === 'object' &&
              // @ts-ignore
              typeof cookiesObjectInSvelteKit.set === 'function'
            ) {
              this.setCookiesInSvelteSSR(
                cookiesObjectInSvelteKit as XSessioinCookiesHandler,
                response
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

  /**
   * Call this method to initialize the x-session for the server side rendering(SSR) with SvelteKit on load() function that is located in routes/+layout.server.ts file
   * @param {XSessionOptions} options - The options for the XSession instance
   * @returns '{ initSvelteSSR: true }' if the x-session is available, otherwise '{ initSvelteSSR: false }'
   * @description
   * ```r
   *
   * The following is the flow of the session check.
   *
   * SSR.                              CSR.
   * (In the root "routes/" directory)
   * +layout.server.ts.                +layout.svelte
   * ------------------------------------------------
   * Session check(No)        —>       createClientSession
   * 										  │
   * send() with API Key      <—       API Key check(No)
   * 		│
   * Set Cookie from API Server
   * 		│
   * Session check(Yes)       —>       API calls
   *                                   Push events from API server
   *
   * ```
   *
   * @example
   *
   * ```ts
   * //
   * // file: src/routes/+layout.server.ts
   * //
   *
   * import { xsession } from "x-session";
   *
   * export async function load(event: any) {
   *
   *   const resp = await xsession.initSvelteSSR({
   *      apiKey: 'my-api-key',
   *      cookies: event.cookies,
   *      clientIPAddress: event.getClientAddress(),
   *      url: 'http://localhost:3000/api',
   *      msgDebug: true,
   *   });
   *
   *   return ({ xsession: resp });
   * }
   * ```
   *
   */
  public async initSvelteSSR(options: XSessionOptions): Promise<object> {
    const __CLASSNAME__ = this.__CLASSNAME__;
    const __FUNCTION__ = 'initSvelteSSR()';

    // Check options parameter
    if (options === null || options === undefined) {
      // error log
      console.error(`${__CLASSNAME__}: ${__FUNCTION__} options parameter is null or undefined! 👎`);
    }

    // Check options.cookies parameter
    if (options.cookies === null || options.cookies === undefined) {
      // error log
      console.error(
        `${__CLASSNAME__}: ${__FUNCTION__} options.cookies parameter is null or undefined! 👎`
      );
    }

    // Check options.cookies.getAll() parameter, if cookies is an object, it is the SvelteKit event.cookies
    options.cookies = options.cookies as XSessioinCookiesHandler;
    if (typeof options.cookies !== 'object' || typeof options.cookies.getAll !== 'function') {
      // error log
      console.error(
        `${__CLASSNAME__}: ${__FUNCTION__} options.cookies.getAll() is not a function! 👎`
      );
    }

    // Check if the x-session is created in the browser using initSvelteCSR() method
    if (this.isCreatedXSession(options.cookies.getAll())) {
      //
      // Load data from the API server
      //
      this._sessionOptions = options; // Save the options for the this.config().send() method use SvleteKit event.cookies
      let respResources = {};
      const msgType = 'api-{action:authorization}-{crud:create}';
      const msgData = { languageCode: 'en-us' };
      await this.config({
        // The API key is to be set in the SSR only, and the browser doesn't need to set.
        // The browser automatically sends the key to the server when this message is sent and received normally.
        apiKey: options.apiKey, // API key is set in SSR only for the secure reason, after then, the CSR can use APIs without API key.
        cookies: options.cookies,
        clientIPAddress: options.clientIPAddress,
        url: options.url,
        msgDebug: options.msgDebug,
      })
        .send(msgType, msgData)
        .then((res: any) => {
          options.msgDebug &&
            console.debug(
              `${__CLASSNAME__}: ${__FUNCTION__} got the response from the API server => `,
              res
            );
          respResources = res.msgData.dataResp;
        })
        .catch((err: any) => {
          // error log
          console.error(`${__CLASSNAME__}: ${__FUNCTION__} error catched! 👎 error msg:`, err);
        });

      // This is a flag to indicate that the page can call xsession.start() for the push events from the API server and can call the APIs.
      return { initSvelteSSR: true };
    }
    // This is a flag to indicate that the page can not call the APIs.
    // So, the page must create a new x-session using xsession.checkXSession().isDisabled().createXSession(); on onMount().
    // And then, the page should reload itself using invalidateAll(). After reloading, this +layout.server.ts will be called again,
    // after then, the page can call xsession.start() for the push events from the API server and can call the APIs.
    return { initSvelteSSR: false };
  }

  /**
   * Call this method to initialize the x-session for the client side rendering(CSR) with SvelteKit on onMount() function that is located in routes/+layout.svelte file
   * @param respFromSSR - The response from the initSvelteSSR() method which is called in the server side rendering(SSR) with SvelteKit on load() function that is located in routes/+layout.server.ts file
   * @returns {boolean} - true if the x-session is started, otherwise false that means you must call initSvelteSSR() method next.
   *
   * @description
   * ```r
   *
   * The following is the flow of the session check.
   *
   * SSR.                              CSR.
   * (In the root "routes/" directory)
   * +layout.server.ts.                +layout.svelte
   * ------------------------------------------------
   * Session check(No)        —>       createClientSession
   * 										  │
   * send() with API Key      <—       API Key check(No)
   * 		│
   * Set Cookie from API Server
   * 		│
   * Session check(Yes)       —>       API calls
   *                                   Push events from API server
   *
   * ```
   *
   * @example
   *
   * ```ts
   * //
   * // file: src/lib/xsession.ts
   * //
   *
   * // XSession: create instance here, for the session.start() put inside the onMount(),
   * //           and for the session.close() put inside the onDestroy() of the root +layout.svelte.
   * //           The session.on() on the root +layout.svelte don't need to call session.off(),
   * //           The sesssion.on() can be seated anywhere, but inside $: reactive statement,
   * //           and the session.off() must be called inside onDestroy() using the return value of session.on().
   * //           This action is to prevent the memory leak.
   * //           You can use session.send() to send message to the server, and get the response from the server.
   * //           In case of using the session.send() use inside OnMount() or OnDestroy().
   * //
   * import { XSession } from "x-session";
   *
   * // msgDebug: true, you can see all messages in browser console
   * export const xsession: XSession = new XSession({
   * 	url: 'http://localhost:3000/api',
   * 	msgDebug: true,
   * });
   * ```
   *
   * ----
   *
   * ```ts
   * //
   * // file: src/routes/+layout.svelte
   * //
   * <script lang="ts">
   * export let data: any;
   * import { xsession } from "$lib/xsession";
   *
   * $: xsessionRespFromSSR = data.xsession;
   *
   * onMount(() => {
   *
   *   const resp = await xsession.initSvelteCSR(xsessionRespFromSSR);
   *   if (!resp) {
   *     // The x-session is not started yet, so, you must call initSvelteSSR() method next.
   *     // Causes all the 'load' functions to re-run
   *     invalidateAll();
   *   }
   *
   * });
   *
   * </script>
   * ```
   */
  public async initSvelteCSR(respFromSSR: { initSvelteSSR: boolean }): Promise<boolean> {
    const __CLASSNAME__ = this.__CLASSNAME__;
    const __FUNCTION__ = 'initSvelteCSR()';

    // This method can not be called in node.js
    console.error(
      `${__CLASSNAME__}: ${__FUNCTION__} This method can not be called in node.js! 👎 You should call in onMount() function of the routes/+layout.svelte file or in the script of the browser.`
    );
    return false;
  }

  private setCookiesInSvelteSSR(
    cookiesObjectInSvelteKit: XSessioinCookiesHandler,
    responseFromNodeFetch: Response
  ): void {
    const __CLASSNAME__ = this.__CLASSNAME__;
    const __FUNCTION__ = 'setCookiesInSvelteSSR()';

    // If you want to see the debug log for this function, set the debugCookiesHanlder to true, as like the following.
    //
    // file: SvelteKit src/routes/+layout.server.ts
    //
    // import { xsession } from "x-session";
    //
    // export async function load(event: any) {
    //
    //   event.cookies.debugCookiesHanlder = true;
    //
    //   xsession.initSvelteSSR({
    //     ...
    //     cookies: event.cookies,
    //     ...
    //   })
    // }

    cookiesObjectInSvelteKit.debugCookiesHanlder &&
      console.debug(
        `${__CLASSNAME__}: node_fetch.then((response) => {}), response =>`,
        util.inspect(responseFromNodeFetch)
      );

    cookiesObjectInSvelteKit.debugCookiesHanlder &&
      console.debug(
        `${__CLASSNAME__}: node_fetch.then((response) => {}), response.headers =>`,
        util.inspect(responseFromNodeFetch.headers)
      );

    // @ts-ignore
    const getAll = responseFromNodeFetch.headers.getAll;
    if (getAll === null || getAll === undefined || typeof getAll !== 'function') {
      if (cookiesObjectInSvelteKit.debugCookiesHanlder) {
        // error log
        console.error(
          `${__CLASSNAME__}: ${__FUNCTION__} response doesn't have getAll() function within the node_fetch.then((response) => {}) !!! 👎`
        );
      }
      return;
    }

    //
    // The following is the example of the responseFromNodeFetch.headers.getAll() result
    //
    // const cookiesFromServer = [
    //   "x-session-key1=76d7:eyJhbGciOiJIUzI1NiJ90NTkyMzNlYWUtNzZkNy00ZTk0LTg1MmEtYmNlYTgyZmU0Zjg00kZCWny_b6jKRY2-iVUeRtKXX39hnsm6nLyPOiHMi_aI; Path=/test; HttpOnly; SameSite=Strict",
    //   "x-session-key2=76d7:eyJhbGciOiJIUzI1NiJ90NTkyMzNlYWUtNzZkNy00ZTk0LTg1MmEtYmNlYTgyZmU0Zjg00kZCWny_b6jKRY2-iVUeRtKXX39hnsm6nLyPOiHMi_aI; Path=/test; HttpOnly; SameSite=Strict"
    // ];
    //

    // @ts-ignore
    const cookiesFromServer = responseFromNodeFetch.headers.getAll('set-cookie');
    cookiesFromServer.forEach((cookie: string) => {
      let name = '';
      let value = '';
      let options: { [key: string]: string } = {};
      cookie.split('; ').forEach((items: string, index: number) => {
        const [_key, _value] = items.split('=');
        if (index === 0) {
          name = _key;
          value = _value;
        } else {
          options[_key] = _value;
        }
      });
      // encodeURIComponent() is not required for the cookie value. But the decodeURIComponent() is required in the server side.
      cookiesObjectInSvelteKit.debugCookiesHanlder &&
        console.debug(
          `${__CLASSNAME__}: ${__FUNCTION__} set cookie using load(event), event.cookies.set() function =>`,
          util.inspect(cookiesObjectInSvelteKit.set),
          cookiesObjectInSvelteKit.set.toString()
        );
      cookiesObjectInSvelteKit.debugCookiesHanlder &&
        console.debug(
          `${__CLASSNAME__}: ${__FUNCTION__} set cookie (The options will be not set by the SvelteKit default options, it's bugs of SvelteKit v4.2.1) =>`,
          name,
          value,
          options
        );
      cookiesObjectInSvelteKit.set(name, value, options);
    });
  }
}

export type {
  XSessionOptions,
  XSessionCookieOptions,
  XSessionCookie,
  XSessionCookieData,
  XSessionMessage,
};
export default XSession;
