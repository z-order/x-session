import assert from 'assert';
import XSession from '../src/browser/x-session-browser';

describe('test/browser/XSession', () => {
  //
  // 1) Create x-session instance (Inside onMount() in Svelte)
  //
  test('XSession...XSessionPushEvent, XSessionPushEventOptions', async () => {
    let testDone = false;
    const xsession = new XSession({ url: 'http://localhost:3000/events' });
    xsession.on('open', (ev) => {
      console.log('open', ev);
    });
    xsession.on('close', (ev) => {
      console.log('close', ev);
      testDone = true;
    });
    xsession.on('error', (ev) => {
      console.log('error', ev);
    });
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
    xsession.on('sticker', (msg) => console.log(msg.type, msg.data, '👍'));
    xsession.on('text', (msg) => console.log(msg.type, msg.data, '👍'));
    xsession.start();
    //xsession.close(); // Later, when you want to close the connection : Inside onDestroy() in Svelte

    async function waitTestDone() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (testDone) {
            resolve(true);
          }
        }, 1000);
      });
    }

    expect(await waitTestDone()).toBe(true);
  });

  /*
  xsession
    .setHeaders({ 'x-session-id': '1234567890' })
    .send('login', { id: 'elonmusk', name: 'twitter', password: 'markzukenberg' })
    .then((res) => console.log(res))
    .catch((err) => console.error(err));

  // static async function
  await xsession
    .config({
      apiKey: '1234567890',
      clientIPAddress: '127.0.0.1',
      method: 'POST',
      url: 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .send('login', { id: 'elonmusk', name: 'twitter', password: 'markzukenberg' })
    .then((res) => console.log(res))
    .catch((err) => console.error(err));

  // and support this
  await xsession
    .config({
      apiKey: '1234567890',
      clientIPAddress: '127.0.0.1',
      method: 'POST',
      url: 'http://localhost:3000/api/login',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .send({ id: 'elonmusk', name: 'twitter', password: 'markzukenberg' })
    .then((res) => console.log(res))
    .catch((err) => console.error(err));
  
    */
});
