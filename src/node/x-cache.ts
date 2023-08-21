import { EventEmitter } from 'node:events';

const _XCACHE_DEFAULT_MAX_AGE = 3600 * 24 * 7; // 7 days
const _XCACHE_DEFAULT_GC_INTERVAL = 3600 * 24; // 1 day
const _XCACHE_DEFAULT_MAX_LISTENERS = 1;

type XCacheConfigKeys = 'maxAge' | 'gcInterval' | 'maxListeners';
const _XCacheConfigKeys: XCacheConfigKeys[] = ['maxAge', 'gcInterval', 'maxListeners'];

type XCacheConfig = {
  maxAge?: number;
  gcInterval?: number; // gergbage collection interval in seconds
  maxListeners?: number; // max number of listeners for single event
};

type XCacheData = {
  key: string;
  value: object;
  cacheControl: {
    _refCount: number; // reference count for this item
    _mallocAt: number; // milliseconds, default: Date.now()
    _writeAt: number; // milliseconds, default: Date.now()
    _readAt: number; // milliseconds, default: Date.now()
    _maxAge: number; // seconds, default: 0 (no limit)
  };
  cacheEvent: Map<string, XCacheEvent>;
};

type XCacheEvnetStatus =
  | 'pending'
  | 'conflict'
  | 'triggered'
  | 'timeout'
  | 'deleted' // reserved
  | 'active' // reserved
  | 'inactive'; // reserved

type XCacheEvent = {
  key: string;
  eventName: string;
  startedAt: number; // milliseconds, default: Date.now()
  lifecycleSeconds: number;
  eventHandler?: (cacheEvent: XCacheEvent) => void;
  cacheData: XCacheData;
  eventStatus: XCacheEvnetStatus;
  getCacheData: () => object;
};

interface XCacheConfigReloader {
  reloadConfig(key: XCacheConfigKeys): void;
}

class XCacheConfigurator extends EventEmitter implements XCacheConfigReloader {
  protected __CLASSNAME__ = 'XCacheConfigurator';

  private _config: { [key: string]: any };
  private _configKeys: XCacheConfigKeys[] = _XCacheConfigKeys;

  constructor(config?: XCacheConfig) {
    super();
    this._config = {
      maxAge: config ? config.maxAge : _XCACHE_DEFAULT_MAX_AGE,
      gcInterval: config ? config.gcInterval : _XCACHE_DEFAULT_GC_INTERVAL,
      maxListeners: config ? config.maxListeners : _XCACHE_DEFAULT_MAX_LISTENERS,
    };
  }

  public reloadConfig(key: XCacheConfigKeys): void {
    throw new Error('Method not implemented.');
  }

  public set(key: XCacheConfigKeys, value: any): XCacheConfigurator {
    const __FUNCTION__ = 'set()';
    if (!this._configKeys.includes(key)) {
      throw new Error(
        `${this.__CLASSNAME__}::${__FUNCTION__} Invalid XCache configuration key: ${key}!`
      );
    }
    this._config[key] = value;
    this.reloadConfig(key);
    return this;
  }

  public get(key: XCacheConfigKeys): any {
    const __FUNCTION__ = 'get()';
    if (!this._configKeys.includes(key)) {
      throw new Error(
        `${this.__CLASSNAME__}::${__FUNCTION__} Invalid XCache configuration key: ${key}!`
      );
    }
    return this._config[key];
  }

  public getConfig(): { [key: string]: any } {
    return this._config;
  }
}

class XCache extends XCacheConfigurator {
  protected __CLASSNAME__ = 'XCache';

  private _memcache: Map<string, any>;
  private _eventTimers: Map<string, NodeJS.Timeout>;
  private _garbageCollector: NodeJS.Timeout;

  constructor(config?: XCacheConfig) {
    super(config);
    this._memcache = new Map();
    this._eventTimers = new Map();
    this._memcache.clear();
    this._eventTimers.forEach((timer) => clearTimeout(timer));
    this._eventTimers.clear();
    this._garbageCollector = setInterval(
      this.freeGarbage.bind(this),
      this.get('gcInterval') * 1000
    );
    this.setMaxListeners(this.get('maxListeners'));
  }

  public reloadConfig(key: XCacheConfigKeys): void {
    if (key === 'maxListeners') {
      this.setMaxListeners(this.get('maxListeners'));
    } else if (key === 'gcInterval') {
      clearTimeout(this._garbageCollector);
      this._garbageCollector = setInterval(
        this.freeGarbage.bind(this),
        this.get('gcInterval') * 1000
      );
    }
  }

  public status(): object {
    return {
      object: 'XCache',
      config: this.getConfig(),
      cacheDataCount: this.count(),
      cacheEventCount: this.getEventCount(),
      status: [
        {
          description: 'number of items in the cache',
          name: 'count',
          value: this.count(),
        },
        {
          description: 'number of events in the cache',
          name: 'eventCount',
          value: this.getEventCount(),
        },
      ],
    };
  }

  public statusAll(): object {
    return {
      object: 'XCache',
      config: this.getConfig(),
      status: [
        {
          description: 'number of items in the cache',
          name: 'count',
          value: this.count(),
        },
        {
          description: 'number of events in the cache',
          name: 'eventCount',
          value: this.getEventCount(),
        },
        {
          description: 'data in the cache',
          name: 'data',
          value: this._memcache.values(),
        },
        {
          description: 'events in the cache',
          name: 'event',
          value: this._eventTimers.values(),
        },
      ],
    };
  }

  public count(): number {
    return this._memcache.size;
  }

  // Methods for data management

  /**
   * @description Create a new item in the cache
   * @param {string} key unique key for the item
   * @param {object} value object to be cached
   * @param {number} maxAge in seconds, default is 604800 (7 days), 0 for no limit
   * @returns {XCache} this
   * @throws {Error} if key already exists
   * @example
   * // must use try {...} catch {...} block
   * const xcache = new XCache();
   * try {
   *   xcache.malloc('key', {a: 1, b: 2});
   * } catch (err) {
   *   console.error(err);
   * }
   */
  public malloc(key: string, value: object, maxAge?: number): XCache {
    const __FUNCTION__ = 'malloc()';
    if (this._memcache.has(key)) {
      throw new Error(`${this.__CLASSNAME__}::${__FUNCTION__} Key ${key} already exists!`);
    }
    const item: XCacheData = {
      key: key,
      value: value,
      cacheControl: {
        _refCount: 1,
        _mallocAt: Date.now(),
        _writeAt: 0,
        _readAt: 0,
        _maxAge: maxAge ? maxAge : this.get('maxAge'),
      },
      cacheEvent: new Map(),
    };
    this._memcache.set(key, item);
    return this;
  }

  /**
   * @description Write a new value to an existing item in the cache
   * @param {string} key unique key for the item
   * @param {object} value object to be cached
   * @param {number} maxAge in seconds, default is 604800 (7 days), 0 for no limit
   * @returns {XCache} this
   * @throws {Error} if key does not exists
   * @example
   * // must use try {...} catch {...} block
   * const xcache = new XCache();
   * try {
   *   xcache.write('key', {a: 1, b: 2});
   * } catch (err) {
   *   console.error(err);
   * }
   */
  public write(key: string, value: object, maxAge?: number): XCache {
    const __FUNCTION__ = 'write()';
    if (!this._memcache.has(key)) {
      throw new Error(`${this.__CLASSNAME__}::${__FUNCTION__} Key ${key} does not exist!`);
    }
    let item: XCacheData = this._memcache.get(key);
    item.value = value;
    item.cacheControl._writeAt = Date.now();
    item.cacheControl._maxAge = maxAge ? maxAge : this.get('maxAge');
    /* there is noe need to set the item back to the _memcache, cause it is a reference
     * this._memcache.set(key, item);
     */
    return this;
  }

  public read(key: string): any | undefined {
    const item: XCacheData = this._memcache.get(key);
    if (item === undefined) {
      return undefined;
    }
    item.cacheControl._readAt = Date.now();
    /* there is noe need to set the item back to the _memcache, cause it is a reference
     * this._memcache.set(key, item);
     * return new Object(item.value); // check between 'return item.value' and 'return new Object(item.value)'
     */
    return item.value;
  }

  public has(key: string): boolean {
    return this._memcache.has(key);
  }

  public free(key: string): boolean {
    const item: XCacheData = this._memcache.get(key);
    if (item != undefined && item.cacheControl._refCount > 0) {
      item.cacheControl._refCount--;
      if (item.cacheControl._refCount === 0) {
        this._memcache.delete(key);
      } else {
        /* there is noe need to set the item back to the _memcache, cause it is a reference
         * this._memcache.set(key, item);
         */
      }
      return true;
    }
    return false;
  }

  /**
   * @description Free all the items in the cache
   * @timeout {number} timeout in seconds
   * @returns {number} number of active items that cannot be freed that are referenced by other items
   *                   or 0 if all items are freed, if not 0, try increase timeout and wait until 0 is returned
   */
  public async freeAll(timeout: number): Promise<number> {
    const now = Date.now();
    this._memcache.forEach((item: XCacheData, key: string) => {
      this.free(key);
    });
    return await new Promise((resolve) =>
      setTimeout(() => {
        const elapsed = Date.now() - now;
        if (elapsed > timeout * 1000) {
          resolve(this._memcache.size);
        }
        if (this._memcache.size == 0) {
          this.forceFreeAll();
          resolve(0);
        }
      }, 1000)
    );
  }

  public forceFreeAll(): void {
    clearInterval(this._garbageCollector);
    this._eventTimers.forEach((timer) => clearTimeout(timer));
    this._eventTimers.clear();
    this._memcache.clear();
  }

  public getRefCount(key: string): number {
    const item: XCacheData = this._memcache.get(key);
    if (item != undefined) {
      return item.cacheControl._refCount;
    }
    return 0;
  }

  private incRefs(key: string): XCacheData | undefined {
    const item: XCacheData = this._memcache.get(key);
    if (item != undefined) {
      item.cacheControl._refCount++;
      /* item.cacheControl._readAt = Date.now();
       * there is noe need to set the item back to the _memcache, cause it is a reference
       * this._memcache.set(key, item);
       */
      return item;
    }
    return undefined;
  }

  private decRefs(key: string): number | undefined {
    const item: XCacheData = this._memcache.get(key);
    if (item != undefined && item.cacheControl._refCount > 0) {
      item.cacheControl._refCount--;
      if (item.cacheControl._refCount === 0) {
        this._memcache.delete(key);
        return 0;
      } else {
        /* there is noe need to set the item back to the _memcache, cause it is a reference
         * this._memcache.set(key, item);
         */
        return item.cacheControl._refCount;
      }
    }
    return undefined;
  }

  private freeGarbage(): void {
    const now = Date.now();
    this._memcache.forEach((item: XCacheData, key: string) => {
      if (item.cacheControl._maxAge > 0) {
        const checkAt = Math.max(
          item.cacheControl._mallocAt,
          item.cacheControl._writeAt,
          item.cacheControl._readAt
        );
        const elapsed = now - checkAt;
        if (elapsed > item.cacheControl._maxAge * 1000) {
          this._memcache.delete(key);
        }
      }
    });
  }

  // Methods for event management
  public event(
    key: string,
    eventName: string
  ): {
    on: (listener: (...args: any[]) => void) => XCache;
    off: (listener?: (...args: any[]) => void) => XCache;
    emit: (...args: any[]) => boolean;
  } {
    const on = this.on.bind(this, this.getEventManagementKey(key, eventName));
    const off = this.off.bind(this, this.getEventManagementKey(key, eventName));
    const emit = this.emit.bind(this, this.getEventManagementKey(key, eventName));
    return { on, off, emit };
  }

  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  public off(eventName: string | symbol, listener?: (...args: any[]) => void): this {
    if (listener !== null && listener !== undefined) {
      return super.off(eventName, listener);
    } else {
      return super.removeAllListeners(eventName);
    }
  }

  public emit(event: string | symbol, ...args: any[]): boolean {
    const cacheEvent: XCacheEvent = args.length > 0 ? args[0] : undefined;
    if (
      cacheEvent !== null &&
      cacheEvent !== undefined &&
      cacheEvent.eventStatus === 'pending' &&
      typeof cacheEvent.cacheData === 'object' &&
      typeof cacheEvent.getCacheData === 'function'
    ) {
      return this.onTriggerSet(cacheEvent, ...args);
    }
    return super.emit(event, ...args);
  }

  private getEventManagementKey(key: string, eventName: string): string {
    return key + '$$' + eventName;
  }

  public createEvent(
    key: string,
    eventName: string,
    lifecycleSeconds: number,
    eventHandler?: (cacheEvent: XCacheEvent) => void
  ): void {
    const __FUNCTION__ = 'createEvent()';

    const item = this.incRefs(key);
    if (item === undefined) {
      console.error(
        `${this.__CLASSNAME__}::${__FUNCTION__} Event with key: ${key} for eventName: ${eventName} does not exist in the _memcache!`
      );
      return;
    }
    let cacheEvent: XCacheEvent = {
      key: key,
      eventName: eventName,
      startedAt: Date.now(),
      lifecycleSeconds: lifecycleSeconds,
      eventHandler: eventHandler,
      cacheData: item,
      eventStatus: 'pending',
      getCacheData: function () {
        return cacheEvent.cacheData.value;
      },
    };
    if (this._eventTimers.has(this.getEventManagementKey(key, eventName))) {
      console.error(
        `${this.__CLASSNAME__}::${__FUNCTION__} Event with key: ${key} for eventName: ${eventName} already existed(conflict) in the _eventTimers!`
      );
      cacheEvent.eventStatus = 'conflict';
      cacheEvent.eventHandler?.bind(null, cacheEvent)();
      this.decRefs(key);
      return;
    }
    /* there is noe need to set the item back to the _memcache, cause it is a reference
     * this.write(key, item);
     * However, we need to update the accesss time of the item
     */
    item.cacheControl._readAt = Date.now();
    item.cacheEvent.set(eventName, cacheEvent);
    const timer = setTimeout(this.onTimerSet.bind(this, cacheEvent), lifecycleSeconds * 1000);
    this._eventTimers.set(this.getEventManagementKey(key, eventName), timer);
    return;
  }

  public triggerEvent(key: string, eventName: string): void {
    const cacheEvent: XCacheEvent = this._memcache.get(key)?.cacheEvent.get(eventName);
    this.onTriggerSet(cacheEvent);
  }

  public deleteEvent(key: string, eventName: string): boolean {
    const __FUNCTION__ = 'deleteEvent()';
    const eventTimerKey = this.getEventManagementKey(key, eventName);
    const timer = this._eventTimers.get(eventTimerKey);
    if (timer !== undefined) {
      clearTimeout(timer);
      this._eventTimers.delete(eventTimerKey);
    } else {
      console.error(
        `${this.__CLASSNAME__}::${__FUNCTION__} Event with key: ${key} for eventName: ${eventName} does not exist in the _eventTimers!`
      );
    }
    const cacheData: XCacheData = this._memcache.get(key);
    const cacheEvent: XCacheEvent = cacheData?.cacheEvent.get(eventName)!;
    if (cacheData === undefined) {
      console.error(
        `${this.__CLASSNAME__}::${__FUNCTION__} Event with key: ${key} for eventName: ${eventName} does not exist in the _memcache!`
      );
    }
    if (cacheEvent === undefined) {
      console.error(
        `${this.__CLASSNAME__}::${__FUNCTION__} Event with key: ${key} for eventName: ${eventName} does not exist in the _memcache.cacheEvent!`
      );
    }
    if (cacheData !== undefined && cacheEvent !== undefined) {
      this._memcache.get(key)?.cacheEvent.delete(eventName);
      return this.decRefs(key) !== undefined ? true : false;
    }
    return false;
  }

  public checkEvent(key: string, eventName: string): boolean {
    const eventTimerKey = this.getEventManagementKey(key, eventName);
    return this._eventTimers.has(eventTimerKey);
  }

  public getCacheEvent(key: string, eventName: string): XCacheEvent | undefined {
    if (key !== null && key !== undefined) {
      return this._memcache.get(key)?.cacheEvent.get(eventName);
    }
    return undefined;
  }

  public getEventCount(key?: string): number {
    if (key !== null && key !== undefined) {
      return this._memcache.get(key)?.cacheEvent.size || 0;
    }
    return this._eventTimers.size;
  }

  public getListenerCount(key: string, eventName: string): number {
    const listenerEventName = this.getEventManagementKey(key, eventName);
    return this.listenerCount(listenerEventName);
  }

  private onTimerSet(cacheEvent: XCacheEvent): void {
    if (cacheEvent === null || cacheEvent === undefined) {
      return;
    }
    const eventTimerKey = this.getEventManagementKey(cacheEvent.key, cacheEvent.eventName);
    const listenerEventName = this.getEventManagementKey(cacheEvent.key, cacheEvent.eventName);
    if (cacheEvent.eventStatus === 'pending') {
      cacheEvent.eventStatus = 'timeout';
    }
    if (this.listenerCount(listenerEventName) > 0) {
      super.emit(listenerEventName, cacheEvent);
    }
    cacheEvent.eventHandler?.bind(null, cacheEvent)();
    this._eventTimers.delete(eventTimerKey);
    this._memcache.get(cacheEvent.key)?.cacheEvent.delete(cacheEvent.eventName);
    this.decRefs(cacheEvent.key);
  }

  private onTriggerSet(cacheEvent: XCacheEvent, ...args: any[]): boolean {
    let emitResult = true;
    if (cacheEvent === null || cacheEvent === undefined) {
      return false;
    }
    const eventTimerKey = this.getEventManagementKey(cacheEvent.key, cacheEvent.eventName);
    const listenerEventName = this.getEventManagementKey(cacheEvent.key, cacheEvent.eventName);
    const timer = this._eventTimers.get(eventTimerKey);
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    cacheEvent.eventStatus = 'triggered';
    if (this.listenerCount(listenerEventName) > 0) {
      emitResult = super.emit(listenerEventName, cacheEvent, ...args);
    }
    cacheEvent.eventHandler?.bind(null, cacheEvent)();
    this._eventTimers.delete(eventTimerKey);
    this._memcache.get(cacheEvent.key)?.cacheEvent.delete(cacheEvent.eventName);
    this.decRefs(cacheEvent.key);
    return emitResult;
  }
}

export type { XCacheEvent, XCacheEvnetStatus };
export default XCache;
