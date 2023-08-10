import XSession from './x-session-node.js';
import { XSessionOptions, XSessionCookieOptions, XSessionMessage } from './x-session-node.js';

class XSessionWrapper extends XSession {
  public static config(
    options: XSessionOptions,
    cookieOptions?: XSessionCookieOptions
  ): XSessionWrapper {
    return new XSessionWrapper(options, cookieOptions);
  }
  public async send(msgTypeOrData: string | any, msgData?: any): Promise<XSessionMessage> {
    return await super.send(msgTypeOrData, msgData);
  }
}
export { XSessionWrapper };
