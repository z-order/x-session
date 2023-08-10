// place files you want to import through the `$lib` alias in this folder.

//
// XSession: create instance here, for the session.start() put inside the onMount(),
//           and for the session.close() put inside the onDestroy() of the root +layout.svelte.
//           The session.on() on the root +layout.svelte don't need to call session.off(),
//           The sesssion.on() can be seated anywhere, but inside $: reactive statement,
//           and the session.off() must be called inside onDestroy() using the return value of session.on().
//           This action is to prevent the memory leak.
//           You can use session.send() to send message to the server, and get the response from the server.
//           In case of using the session.send() use inside OnMount() or OnDestroy().
//
import { XSession } from 'x-session';
//
// msgDebug: true, you can see all messages in browser console
export const xsession: XSession = new XSession({
	url: 'http://localhost:3000/events',
	msgDebug: false
});
