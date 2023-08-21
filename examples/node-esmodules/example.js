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

  console.log('\n\ncheck garbage collecter ... please wait 60 seconds ...');
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

  debugShell({ xcache });
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
  let key = 'client-session-1';
  let eventName = 'waiting-user-action';
  let lifecycleSeconds = 5; // seconds

  xcache.malloc(key, {
    status: 'waiting-user-action',
    value1: 'value1',
    value2: 'value2',
    value3: 'value3',
    value4: { value41: 'value41', value42: 'value42' },
  });

  console.log('\n\nxcache.statusAll() =>', xcache.statusAll());
  await sleep(1000);
  await enterKey('xcache.event().on(() => {}) and xcache.event().emit() test ...');
  console.clear();

  xcache.event(key, eventName).on((cacheEvent) => {
    console.log(
      'xcache.event().on(() => {})',
      `key: ${key}, eventName: ${eventName}`,
      '\ncacheEvent =>',
      cacheEvent,
      '\ncacheEvent.eventStatus =>',
      cacheEvent.eventStatus,
      '\ncacheEvent.getCacheData() =>',
      cacheEvent.getCacheData()
    );
  });

  // create event for xcache.event().on(() => {})
  xcache.createEvent(key, eventName, lifecycleSeconds);

  // add some data to the cache data: xcache.read(key)
  xcache.read(key).someAddedData1 = 'someAddedData...1';

  // add some data to the cache event: xcache.getCacheEvent(key, eventName).getCacheData()
  const cacheEvent = xcache.getCacheEvent(key, eventName);
  if (cacheEvent !== null && cacheEvent !== undefined) {
    cacheEvent.getCacheData().someAddedData2 = 'someAddedData...2';
  }

  // emit event using xcache.event().emit() or xcache.triggerEvent(key, eventName)
  xcache.event(key, eventName).emit(cacheEvent);

  console.log('\n\nxcache.statusAll() =>', xcache.statusAll());
  await sleep(1000);
  await enterKey();
  console.clear();

  // remove event handler for xcache.event().on(() => {})
  xcache.event(key, eventName).off();

  // delete event of xcache.createEvent(key, eventName, lifecycleSeconds) if it exists (pending)
  // or it is deleted automatically when the event is triggered or timed out
  // xcache.event(key, eventName).emit(cacheEvent) will delete the event automatically after it is triggered
  // and the below line will display two warning messages
  xcache.deleteEvent(key, eventName);

  // more easy way to create event and process it
  xcache.createEvent(key, eventName, lifecycleSeconds, async (cacheEvent) => {
    console.log('xcache.createEvent(() => {})', 'cacheEvent:', cacheEvent);
    console.log('cacheEvent.getCacheData()', cacheEvent.getCacheData());
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

    // delete event
    await sleep(1000);
    await enterKey('Press Enter to delete event...inside event handler');
    console.clear();
    console.log('\n\nxcache.deleteEvent() =>', xcache.deleteEvent(key, eventName)); // output: error message with event name is not found
  });

  console.log('\n\nxcache.statusAll() =>', xcache.statusAll());
  await sleep(1000);
  await enterKey();
  console.clear();

  // delete event
  console.log('\n\nxcache.deleteEvent() => waiting...');
  await sleep(1000);
  await enterKey('Press Enter to delete event...outside event handler');
  console.clear();
  console.log('\n\nxcache.deleteEvent() =>', xcache.deleteEvent(key, eventName)); // output: error message with event name is not found

  await sleep(1000);
  await enterKey();
  console.clear();
  console.log('\n\nxcache.statusAll() =>', xcache.statusAll());

  await sleep(1000);
  await enterKey('Press Enter to create 3(key)x3(event) for trigger test...');
  console.clear();

  // trigger event
  for (let i = 0; i < 3; i++) {
    key = `trigger-session-${i}`;
    lifecycleSeconds = 60; // seconds

    xcache.malloc(key, { value: { status: 'waiting-user-action' } });

    for (let j = 0; j < 3; j++) {
      eventName = `event::${j}-trigger-session-${i}`;
      xcache.createEvent(key, eventName, lifecycleSeconds, async (cacheEvent) => {
        console.log(
          `for(i=${i}, j=${j}) loop => xcache.createEvent(() => {})`,
          'cacheEvent:',
          cacheEvent
        );
        switch (cacheEvent.eventStatus) {
          case 'conflict': // the same event name already exists (pending)
            break;
          case 'triggered': // triggered by the process to indicate the job is done
            break;
          case 'timeout': // the event is timed out
            break;
        }
      });
    }
  }

  console.log('\n\nxcache.statusAll() =>', xcache.statusAll());
  await sleep(1000);
  await enterKey(`Press Enter to trigger ...`);
  console.clear();

  // call an event for the each key
  for (let i = 0; i < 3; i++) {
    key = `trigger-session-${i}`;
    eventName = `event::${i}-trigger-session-${i}`;
    xcache.read(key).value.status = 'triggered';
    xcache.triggerEvent(key, eventName);
  }

  await sleep(1000);
  await enterKey();
  console.clear();
  console.log('\n\nxcache.statusAll() =>', xcache.statusAll());

  debugShell({ xcache });
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function enterKey(message = 'Press Enter to continue...') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(message, (input) => {
      rl.close();
      resolve(input); // If you want to get the input, otherwise just resolve()
    });
  });
}

async function debugShell(object) {
  let { xcache } = object;
  let rl = '';
  do {
    try {
      await sleep(1000);
      rl = await enterKey('Press Enter to continue or type "q" to quit...');
      if (rl === 'q' || rl === 'Q' || rl === 'quit' || rl === 'Quit') {
        process.exit(0);
      } else if (rl === 'debug') {
        process.debug();
        break;
      } else if (rl === '') {
        console.clear();
        console.log('\n\nxcache.statusAll() =>', xcache.statusAll());
      } else {
        console.log(eval(rl));
      }
    } catch (err) {
      console.log(err);
    }
  } while (true);
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

const rl = await enterKey(
  '1) runTestXCacheData or 2) runTestXCacheEvent or 3) quit? [default: 1] '
);
switch (rl) {
  case '':
  case '1':
    await runTestXCacheData();
    break;
  case '2':
    await runTestXCacheEvent();
    break;
  case '3':
    process.exit(0);
}
