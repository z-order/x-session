import { XSession } from './node_modules/x-session/dist/browser/mjs/index.js';
//
//
const title = 'XSession Class Test - XSession.html';
//
//
// When the body is loaded, do something
window.addEventListener('load', () => {
  // Append <h1> tag to <body>
  const h1 = document.createElement('h1');
  h1.textContent = title;
  document.body.appendChild(h1);
  // Do test
  doTest1();
});

const doTest1 = () => {
  //
  // XSession: create instance, on, start, close
  //
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
  //
};
/* expected output:
  doTest1(): ...
*/
//
//
