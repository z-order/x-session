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

onMount(() => {
  if (xsessionSet === false) {
    _$logger.debug.TraceLayoutAndPage(
      '/+layout.svelte',
      $page.route.id,
      'onMount for the x-session'
    );
    // Here, x-session module is loaded
    // ...
    // ... and more ...
    // And then, set cookie and more to convey x-session to the server
    // ...
    // Below is an example of setting cookie
    document.cookie = 'browserInfo=test; path=/; domain=localhost; samesite=Strict; max-age=3600;';
    // Create a new client session if the client session does not exist
    // ...
    // And with the client session, the user can access the server
    // ...
    // Here, entry point of the application for the user
    // ...
    // Causes all the 'load' functions to re-run
    invalidateAll();
  }
});

import XSessionPushEvent from './sse-browser';

class XSessionWrapper {
  private __CLASSNAME__ = 'XSessionWrapper';
  private _xsession: XSessionPushEvent | null = null;

  constructor(options: XSessionPushEventOptions) {
    this._xsession = options;
  }
}

// 1) Create x-session instance (Inside onMount() in Svelte)
const xsession = new XSessionPushEvent({ url: 'http://localhost:3000/events' });
xsession.createClientSession(); // Create a new client session and set cookie the browser information encrypted with the client session id
xsession.on('open', () => {});
xsession.on('close', () => {});
xsession.on('error', () => {});
xsession.on('message', (msg) => {
  switch (msg.type) {
    case 'sticker':
      console.log('sticker:', msg.data);
      break;
    case 'text':
      console.log('text:', msg.data);
      break;
    default:
      break;
  }
});
xsession.start();
xsession.close();

// 2)

// 3)

// Later, when you want to close the connection : Inside onDestroy() in Svelte
xsession.close();

xsession.on(message('sticker'), (ctx) => ctx.reply('👍'));
