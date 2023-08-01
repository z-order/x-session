// place files you want to import through the `$lib` alias in this folder.

import { XSession } from 'x-session';
//
// XSession: create instance, on, start, close
//
export const xsession = new XSession({ url: 'http://localhost:3000/events', msgDebug: true }); // msgDebug: true, you can see all messages in browser console
