// place files you want to import through the `$lib` alias in this folder.

//
// XSession: create instance, on, start, close
//
import { XSession } from 'x-session';
//
// msgDebug: true, you can see all messages in browser console
export const xsession: XSession = new XSession({
	url: 'http://localhost:3000/events',
	msgDebug: false
});

console.debug('xsession', xsession);
