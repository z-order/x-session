//
// EventTarget Object, making a class like as EventEmitter in Node.js
//

type XSessionEventListener = { id: number; fn: (...args: any) => void };

class XSessionEventEmitter extends EventTarget {
  protected __CLASSNAME__ = 'XSessionEventEmitter';

  private _listenerId = 0;
  private _listeners: { [key: string]: Array<XSessionEventListener> };

  constructor() {
    super();
    this._listeners = {};
  }

  public eventNames() {
    return Object.keys(this._listeners);
  }

  private listener(e: any) {
    this._listeners[e.type].forEach(({ id, fn }: { id: number; fn: (...args: any) => void }) => {
      fn(...e.detail.args);
    });
  }

  public on(eventName: string, customListener: (...args: any) => void): number {
    this._listenerId++;
    const eventNameOn = eventName + `$$${this._listenerId}`;
    if (!this._listeners[eventNameOn]) {
      this._listeners[eventNameOn] = [];
    }
    this._listeners[eventNameOn].push({ id: this._listenerId, fn: customListener });
    this.addEventListener(eventNameOn, this.listener);
    return this._listenerId;
  }

  public off(listenerId: number) {
    const eventNamesOn = Object.keys(this._listeners).filter((key) => {
      return key.endsWith(`$$${listenerId}`);
    });
    eventNamesOn.forEach((eventNameOn) => {
      this.removeEventListener(eventNameOn, this.listener);
      this._listeners[eventNameOn].forEach(
        ({ id, fn }: { id: number; fn: (...args: any) => void }) => {
          this._listeners[eventNameOn].pop();
        }
      );
      delete this._listeners[eventNameOn];
    });
  }

  public emit(eventName: string, ...args: any) {
    const eventNamesOn = Object.keys(this._listeners).filter((key) => {
      return key.startsWith(eventName + '$$');
    });
    eventNamesOn.forEach((eventNameOn) => {
      const event = new CustomEvent(eventNameOn, {
        detail: { args: args },
      });
      return this.dispatchEvent(event);
    });
  }
}

const DEFAULT_RECONNECT_INTERVAL = 5000;
const DEFAULT_MSG_DEBUG = false;
const DEFAULT_USE_JSON_STRINGIFY = true;

/**
 * @url URL of the server-side event (default: 'http://localhost:3000/events')
 * @reconnectInterval reconnect interval in milliseconds if the connection is lost (default: 5000)
 * @msgDebug true if you want to see the messages in the browser console (default: false)
 * @useJSONStringify true if you want to use JSON.stringify()/JSON.parse() communicating the messages (default: true, if false, you can use data as string)
 */
interface XSessionPushEventOptions {
  url: string;
  reconnectInterval?: number; // milliseconds
  msgDebug?: boolean;
  useJSONStringify?: boolean;
}

interface XSessionClientSessionId {
  get getClientSessionId(): string | undefined;
}

class XSessionPushEvent extends XSessionEventEmitter implements XSessionClientSessionId {
  protected __CLASSNAME__ = 'XSessionPushEvent';

  private _opened = false;
  private _options: XSessionPushEventOptions;
  private _eventSource: EventSource | null = null;
  private _reconnectIntervalId: NodeJS.Timeout | null = null;

  constructor(options: XSessionPushEventOptions) {
    super();
    this._options = options;
    this._options.msgDebug = this._options.msgDebug || DEFAULT_MSG_DEBUG;
    this._options.useJSONStringify = this._options.useJSONStringify || DEFAULT_USE_JSON_STRINGIFY;
    this.onopen = this.onopen.bind(this);
    this.onerror = this.onerror.bind(this);
    this.onmessage = this.onmessage.bind(this);
  }

  get getClientSessionId(): string | undefined {
    throw new Error('Method not implemented.');
  }

  public start(): void {
    if (this.isOpen()) {
      return;
    }
    this.connect();
  }

  public restart(): void {
    this.connect();
  }

  private connect(): void {
    // If an EventSource already exists, close it before creating a new one
    this.closeIfOpen();
    this._eventSource = new EventSource(this._options.url);
    this._eventSource.onopen = this.onopen;
    this._eventSource.onerror = this.onerror;
    this._eventSource.onmessage = this.onmessage;
  }

  private onopen(ev: Event) {
    this._opened = true;
    console.log(
      `${this.__CLASSNAME__}: Connection opened, x-session-client: ${this.getClientSessionId}`
    );
    // If a reconnection interval isn't active, activate it since we're now connected
    if (!this._reconnectIntervalId) {
      this._reconnectIntervalId = setInterval(
        this.reconnectCheck,
        this._options.reconnectInterval || DEFAULT_RECONNECT_INTERVAL
      );
    }
    this.emit('open', ev);
  }

  private onerror(ev: Event) {
    console.error(`${this.__CLASSNAME__}: 'EventSource failed:`, ev);
    if (this._opened || this._eventSource?.readyState === EventSource.OPEN) {
      this._opened = false;
      console.log(`${this.__CLASSNAME__}: Connection closed`);
      this.emit('close', ev);
    } else {
      console.log(`${this.__CLASSNAME__}: Connection error`);
      this.emit('error', ev);
    }
  }

  private onmessage(ev: MessageEvent) {
    this._options.msgDebug && console.debug(`${this.__CLASSNAME__}: New message:`, ev);
    if (ev.data && typeof ev.data === 'string') {
      if (this._options.useJSONStringify) {
        try {
          const data = JSON.parse(ev.data ?? '{}');
          if (data.msgType) {
            this.emit('message', { type: data.msgType, data: data.msgData });
            this.emit(data.msgType, { type: data.msgType, data: data.msgData });
          }
        } catch {
          console.error(
            `${this.__CLASSNAME__}: 'onmessage JSON.parse() failed:`,
            ev,
            "If you don't want to use JSON.stringify()/JSON.parse(), set useJSONStringify: false in the options"
          );
          this.emit('message', { type: 'text', data: ev.data });
        }
      } else {
        this.emit('message', { type: 'text', data: ev.data });
      }
      return;
    }
    // ev.data from the server-side should be an object "[object Object]" that is just a string not an real object
    // so, following code will not be executed
    if (ev.data && typeof ev.data === 'object') {
      const { msgType, msgData } = ev.data;
      console.log('ev.data:', ev.data, 'msgType:', msgType, 'msgData:', msgData);
      if (msgType) {
        this.emit('message', { type: msgType, data: msgData });
        this.emit(msgType, { type: msgType, data: msgData });
      }
      return;
    }
  }

  public close(): void {
    //
    // This log occurs when the connection is happened ... Why? check later !!!
    //console.debug(`${this.__CLASSNAME__}: Closing connection...?`);
    //
    // If an EventSource exists, close it
    if (this._eventSource) {
      console.debug(`${this.__CLASSNAME__}: Closing connection...Done!`);
      this._eventSource.close();
      this._eventSource = null;
      this._opened = false;
    }
    // If a reconnection interval is currently active, clear it
    if (this._reconnectIntervalId) {
      clearInterval(this._reconnectIntervalId);
      this._reconnectIntervalId = null;
    }
  }

  private isOpen(): boolean {
    if (this._opened || this._eventSource?.readyState === EventSource.OPEN) {
      this._opened = true;
      return true;
    }
    return false;
  }

  private closeIfOpen(): void {
    if (this._opened || this._eventSource?.readyState === EventSource.OPEN) {
      this.close();
    }
  }

  private reconnectCheck(): void {
    // If the EventSource's readyState is closed, reconnect
    if (this._eventSource?.readyState === EventSource.CLOSED) {
      this.connect();
    }
  }
}

export type { XSessionPushEventOptions };
export default XSessionPushEvent;
