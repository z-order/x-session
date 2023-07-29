//
// EventTarget Object, making a class like as EventEmitter in Node.js
//
class XSessionEventEmitter extends EventTarget {
  // private __CLASSNAME__ = 'XSessionEventEmitter';

  private _listeners: { [key: string]: Array<(...args: any) => void> };

  constructor() {
    super();
    this._listeners = {};
  }

  eventNames() {
    return Object.keys(this._listeners);
  }

  listener(e: any) {
    this._listeners[e.type].forEach((customListener: (...args: any) => void) => {
      customListener(...e.detail.args);
    });
  }

  on(eventName: string, customListener: (...args: any) => void) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this._listeners[eventName].push(customListener);
    this.addEventListener(eventName, this.listener);
  }

  emit(eventName: string, ...args: any) {
    if (!this._listeners[eventName]) {
      return false;
    }
    const event = new CustomEvent(eventName, {
      detail: { args: args },
    });
    return this.dispatchEvent(event);
  }
}

const DEFAULT_RECONNECT_INTERVAL = 5000;
type XSessionPushEventOptions = {
  url: string;
  reconnectInterval?: number; // milliseconds
};

class XSessionPushEvent extends XSessionEventEmitter {
  private __CLASSNAME__ = 'XSessionPushEvent';

  private _options: XSessionPushEventOptions;
  private _eventSource: EventSource | null = null;
  private _reconnectIntervalId: NodeJS.Timer | null = null;

  constructor(options: XSessionPushEventOptions) {
    super();
    this._options = options;
    this.onopen = this.onopen.bind(this);
    this.onerror = this.onerror.bind(this);
    this.onmessage = this.onmessage.bind(this);
  }

  public start(): void {
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
    console.log(`${this.__CLASSNAME__}: Connection opened`);
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
    if (this._eventSource?.readyState === EventSource.CLOSED) {
      this.emit('close', ev);
    } else {
      this.emit('error', ev);
    }
  }

  private onmessage(ev: Event) {
    console.log(`${this.__CLASSNAME__}: New message:`, ev);
    this.emit('message', ev);
  }

  public close(): void {
    // If an EventSource exists, close it
    if (this._eventSource) {
      this._eventSource.close();
      this._eventSource = null;
    }
    // If a reconnection interval is currently active, clear it
    if (this._reconnectIntervalId) {
      clearInterval(this._reconnectIntervalId);
      this._reconnectIntervalId = null;
    }
    this.emit('close');
  }

  private closeIfOpen(): void {
    this.close();
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
