import util from 'util';
import readline from 'readline';
import { XCache } from 'x-session';

const runTestXCacheData = async () => {
  //
  // xcache
  //

  const xcache = new XCache();

  console.log('\n\nxcache.status() =>', xcache.status());
  await sleep(1000);
  await enterKey();
  console.clear();

  // xcache options
  xcache.set('maxAge', 5); // seconds, for testing, in production, set to 7 days (default) ~ 30 days
  xcache.set('gcInterval', 1); // seconds, for testing, in production, set to 24 hours (default)
  xcache.set('maxListeners', 1);

  console.log('maxAge', xcache.get('maxAge'));
  console.log('gcInterval', xcache.get('gcInterval'));
  console.log('maxListeners', xcache.get('maxListeners'));
  console.log('config:', xcache.getConfig());

  console.log('\n\nxcache.status() =>', xcache.status());
  await sleep(1000);
  await enterKey();
  console.clear();

  //---- xcache data ----//

  xcache.malloc('key-1', { key: 'key-1', value: 'value-1' });
  xcache.malloc('key-2', { key: 'key-2', value: 'value-2' });
  xcache.malloc('key-3', { key: 'key-3', value: 'value-3' });

  console.log(xcache.read('key-1')); // output: { key: 'key-1', value: 'value-1' }
  console.log(xcache.read('key-2')); // output: { key: 'key-2', value: 'value-2' }
  console.log(xcache.read('key-3')); // output: { key: 'key-3', value: 'value-3' }

  for (let i = 0; i < 5; i++) {
    console.log(
      `key-1: ${util.inspect(xcache.read('key-1'), null)}`,
      `key-2: ${util.inspect(xcache.read('key-2'), null)}`,
      `key-3: ${util.inspect(xcache.read('key-3'), null)}`
    );
    await sleep(1000);
  }

  console.log('after for loop => xcache.read()', xcache.read('key'));

  console.log('\n\nxcache.statusAll() =>', xcache.statusAll());
  await enterKey();
  console.clear();

  console.log('Waiting 6 seconds ...');
  await enterKey();
  await sleep(6000);

  console.log('after 6 seconds later => xcache.read()', xcache.read('key'));

  console.log('\n\nxcache.statusAll() =>', xcache.statusAll());
  await sleep(1000);
  await enterKey();
  console.clear();

  // change xcache options
  xcache.set('maxAge', 60); // seconds, for testing, in production, set to 7 days (default) ~ 30 days
  xcache.set('gcInterval', 10); // seconds, for testing, in production, set to 24 hours (default)
  xcache.set('maxListeners', 1);

  let start = Date.now();
  let cacheDataCount = 4096000;
  console.log(`start bulk set of ${cacheDataCount} => xcache.malloc() ...`);

  for (let i = 10; i < cacheDataCount; i++) {
    xcache.malloc(`key-${i}`, { key: `key-${i}`, value: `value-${i}` });
  }

  console.log(
    `start bulk set of ${cacheDataCount} => xcache.malloc() ... done [${Date.now() - start}ms]`
  );

  console.log('\n\nxcache.status() =>', xcache.status());
  await sleep(1000);
  await enterKey();
  console.clear();

  start = Date.now();
  console.log(`start bulk set of ${cacheDataCount} => xcache.write() ...`);

  for (let i = 10; i < cacheDataCount; i++) {
    xcache.write(`key-${i}`, { key: `key-${i}`, value: `value-${i}-modified` });
  }

  console.log(
    `start bulk set of ${cacheDataCount} => xcache.write() ... done [${Date.now() - start}ms]`
  );

  console.log('\n\nxcache.status() =>', xcache.status());
  await sleep(1000);
  await enterKey();
  console.clear();

  start = Date.now();
  console.log(`start reading cached data => xcache.read() ...`);

  const keyIndices = [
    0,
    Math.round(cacheDataCount * 0.9),
    Math.round(cacheDataCount * 0.8),
    Math.round(cacheDataCount * 0.5),
    Math.round(cacheDataCount * 0.3),
    Math.round(cacheDataCount * 0.2),
    Math.round(cacheDataCount * 0.1),
    Math.round(cacheDataCount * 0.05),
    Math.round(cacheDataCount),
  ];

  keyIndices.forEach((keyIndex) => {
    const key = `key-${keyIndex}`;
    console.log(`keyIndex=${keyIndex}, Key=${key}, Value=${util.inspect(xcache.read(key), null)}`);
  });

  console.log(`start reading cached data => xcache.read() ... done [${Date.now() - start}ms]`);

  console.log('\n\nxcache.status() =>', xcache.status());
  await sleep(1000);

  console.log('\n\ncheck garbage collecter ...');
  await enterKey();

  do {
    console.clear();
    console.log('\n\nxcache.status() =>', xcache.status());
    await sleep(1000);
  } while (xcache.status().cacheDataCount > 0);

  console.clear();
  console.log('\n\nxcache.status() =>', xcache.status());

  console.log('\n\ncheck garbage collecter ... done');
  await enterKey();
};

const runTestXCacheEvent = async () => {
  //
  // xcache
  //

  const xcache = new XCache();

  console.log('\n\nxcache.status() =>', xcache.status());
  await sleep(1000);
  await enterKey();
  console.clear();

  //---- xcache event ----//
  const key = 'client-session-1';
  const eventName = 'waiting-user-action';
  const lifecycleSeconds = 5; // seconds

  xcache.malloc(key, { key: key, value: { status: 'waiting-user-action' } });

  console.log('\n\nxcache.statusAll() =>', xcache.statusAll());
  await sleep(1000);
  await enterKey();
  console.clear();

  /*
  xcache.event(key, eventName).on((data) => {
    console.log('xcache.event().on(() => {})', 'key:', key, 'eventName:', eventName, 'data:', data);
  });

  xcache.event(key, eventName).emit({ action: 'messenger-login', status: 'success' });
  */

  xcache.createEvent(key, eventName, lifecycleSeconds, async (cacheEvent) => {
    console.log('xcache.createEvent(() => {})', 'cacheEvent:', cacheEvent);
    switch (cacheEvent.eventStatus) {
      case 'conflict': // the same event name already exists (pending)
        break;
      case 'triggered': // triggered by the process to indicate the job is done
        break;
      case 'timeout': // the event is timed out
        break;
    }
    await sleep(1000);
    await enterKey();
    console.clear();
    console.log('\n\nxcache.statusAll() =>', xcache.statusAll());

    await sleep(1000);
    await enterKey();
    console.clear();
    console.log('\n\nxcache.deleteEvent() =>', xcache.deleteEvent(key, eventName)); // output: error message with event name is not found
  });

  await sleep(1000);
  await enterKey();
  console.clear();
  console.log('\n\nxcache.deleteEvent() =>', xcache.deleteEvent(key, eventName)); // output: error message with event name is not found

  await sleep(1000);
  await enterKey();
  console.clear();
  console.log('\n\nxcache.statusAll() =>', xcache.statusAll());
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function enterKey() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Press Enter to continue...', (input) => {
      rl.close();
      resolve(input); // If you want to get the input, otherwise just resolve()
    });
  });
}

// override console.log to print objects to the fullest depth
const myconsole = new console.Console({
  stdout: process.stdout,
  stderr: process.stderr,
  inspectOptions: {
    depth: null, // this will ensure objects are logged to the fullest depth
    colors: true, // enabling colored output; you can skip this or adjust as needed
  },
});
console.log = myconsole.log;
console.clear();
console.group();

//runTestXCacheData();
runTestXCacheEvent();
