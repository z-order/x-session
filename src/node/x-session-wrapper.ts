import XSession, { type XSessionCookie } from './x-session-node.js';
import { XSessionOptions, XSessionCookieOptions, XSessionMessage } from './x-session-node.js';

class XSessionWrapper extends XSession {
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

  public static async initSvelteSSR(options?: XSessionOptions): Promise<object> {
    return await new XSessionWrapper(options).initSvelteSSR(options);
  }

  public static async initSvelteCSR(respFromSSR: { initSvelteSSR: boolean }): Promise<boolean> {
    return await new XSessionWrapper({ url: 'localhost' }).initSvelteCSR(respFromSSR);
  }
}
export { XSessionWrapper };
