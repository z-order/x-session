import XSession, { type XSessionCookie } from './x-session-browser.js';
import { XSessionOptions, XSessionCookieOptions, XSessionMessage } from './x-session-browser.js';
class XSessionWrapper extends XSession {
  public static __CLASSNAME__ = 'XSessionWrapper';
  //
  public static config(
    options: XSessionOptions,
    cookieOptions?: XSessionCookieOptions
  ): XSessionWrapper {
    return new XSessionWrapper(options, cookieOptions);
  }

  public static isCreatedXSession(cookies?: XSessionCookie[]): boolean {
    return new XSessionWrapper({ url: 'localhost' }).isCreatedXSession(cookies);
  }

  public static isAvailableAPIKey(cookies?: XSessionCookie[]): boolean {
    return new XSessionWrapper({ url: 'localhost' }).isAvailableAPIKey(cookies);
  }

  public async send(msgTypeOrData: string | any, msgData?: any): Promise<XSessionMessage> {
    return await super.send(msgTypeOrData, msgData);
  }

  public static async initSvelteSSR(options: XSessionOptions): Promise<object | undefined> {
    return await new XSessionWrapper(options).initSvelteSSR(options);
  }

  public static async initSvelteCSR(respFromSSR: { initSvelteSSR: boolean }): Promise<boolean> {
    const __CLASSNAME__ = XSessionWrapper.__CLASSNAME__;
    const __FUNCTION__ = 'initSvelteCSR()';

    console.error(
      `${__CLASSNAME__}: ${__FUNCTION__} This method can not be called in xsession wrapper class(${XSessionWrapper.__CLASSNAME__})! 👎 You must use an instance of XSession class in the CSR or in the script of the browser.`
    );
    return false;
  }
}
export { XSessionWrapper };
