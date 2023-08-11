# x-session client for browsers and SvelteKit

This project created by using `npm init vite`.

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Developing

Once you've git clone a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## RESTful API Calls - Case by case connection

API call flow is as below,

```r
Browser(CSR) -> [HTTP(S) Request] -> SvelteKit(SSR) -> [HTTP(S) Request] -> API Server
                   └ Connect                                                   │
                                                                               │──  MemCache
                                                                               │──  Database
                                                                               │
Browser(CSR) <- [HTTP(S) Response] <- SvelteKit(SSR) <- [HTTP(S) Response] <- API Server
                   └ Disconnect
```

## Push Event(SSE) - Keep alive connection

Push events from the API server are as below,

```r
Browser(CSR) -> [HTTP(S) Connected] -> Push Server(SSE) -> [HTTP(S) Connected] -> API Server
                   └ Connect                                                         │
                                                                                     │──  MemCache
                                                                                     │──  Database
                                                                                     │
Browser(CSR) <- [HTTP(S) Push event] <- Push Server(SSE) <- [HTTP(S) Push event] <- API Server
                   └ Connected - Keep alive
```

## `x-session` module on RESTful API Calls

```r
Browser(CSR) -> [HTTP(S) Request] -> SvelteKit(+[page.]server.ts) -> [HTTP(S) Request] -> API Server
    │              └ Connect             │        └ Form actions                             │
    └ x-session browser module           └ x-session node module                             │──  MemCache
                                                                                             │──  Database
                                                                                             │
Browser(CSR) <- [HTTP(S) Response] <- SvelteKit(+[page.]server.ts) <- [HTTP(S) Response] <- API Server
    │              └ Disconnect          │        └ Form actions
    └ x-session browser module           └ x-session node module
```

## `x-session` module on Push Event(SSE)

```r
Browser(CSR) -> [HTTP(S) Connected] -> Push Server(SSE) -> [HTTP(S) Connected] -> API Server
    │              └ Connect               │                                         │
    └ x-session browser module             └ x-session node module                   │──  MemCache
                                                                                     │──  Database
                                                                                     │
Browser(CSR) <- [HTTP(S) Push event] <- Push Server(SSE) <- [HTTP(S) Push event] <- API Server
    │              └ Connected - Keep alive │
    └ x-session browser module              └ x-session node module
```

## `SvelteKit` integrated architecture for the secure session

```r
SSR.                              CSR.
(In the root "routes/" directory)
+layout.server.ts.                +layout.svelte
------------------------------------------------
Session check(No)        —>       createClientSession
                                          │
send() with API Key      <—       API Key check(No)
        │
Set Cookie from API Server
        │
Session check(Yes)       —>       API calls
```

## Tree Structure for the Examples

```r
x-session-browser-sveltekit/
├─ src/
│  ├─ +layout.svelte          # xsession.on(), xsession.checkXSession().isDisabled().createXSession().start(), xsession.close()
│  ├─ +page.svelte            # xsession.on(), xsession.off()
│  ├─ lib/
│  │  ├─ xsession.ts          # Create a x-session instance for SSE(Server Sent Events)
│  ├─ routes/
│  │  ├─ 1-xsession-send      # example 1
│  │  │  ├─ +page.svelte      # xsession.config().setHeaders().send()
│  │  │
│  │  ├─ 2-xsession-send-static  # example 2
│  │  │  ├─ +page.svelte         # xsession.config().setHeaders().send()
│  │  │
│  │  ├─ 3-xsession-send-server-side  # example 3
│  │  │  ├─ +page.server.ts           # xsession.config().send()
│  │  │  ├─ +page.svelte
```

## src/lib/xsession.ts

```ts
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
```

## src/routes/+layout.svelte

```svelte
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { xsession } from '$lib/xsession';
	let msgFromServer: object | null = null;

	$: {
		xsession.on('open', (ev: any) => {
			console.log('XSession: open', ev);
		});
		xsession.on('close', (ev: any) => {
			console.log('XSession: close', ev);
		});
		xsession.on('error', (ev: any) => {
			console.log('XSession: error', ev);
		});
		xsession.on('message', (msg: { type: any; data: any }) => {
			switch (msg.type) {
				case 'sticker':
					msgFromServer = msg;
					console.log('on:message(sticker)', msg.data);
					break;
				case 'text':
					msgFromServer = msg;
					console.log('on:message(text)', msg.data);
					break;
				default:
					break;
			}
		});
		xsession.on('sticker', (msg: { type: any; data: any }) =>
			console.log('on:sticker', msg.type, msg.data, '=> 👍')
		);
		xsession.on('text', (msg: { type: any; data: any }) =>
			console.log('on:text', msg.type, msg.data, '=> 👍')
		);
	}
	onMount(() => {
		xsession.checkXSession().isDisabled().createXSession().start();
	});
	onDestroy(() => {
		xsession.close();
	});
</script>

<main>
	<h1>XSession</h1>
	<h1>Hello XSession users !!!</h1>
	<h2>Message from server:</h2>
	<code lang="js">
		{#if msgFromServer}
			<pre>{JSON.stringify(msgFromServer, null, 2)}</pre>
		{:else}
			<em>no message</em>
		{/if}
	</code>
	<slot />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: left;
		justify-content: center;
	}
	h1 {
		color: #dddddd;
	}
	h2 {
		color: #dddddd;
	}
	code {
		padding: 1em;
		border-radius: 0.5em;
		background-color: black;
		color: aqua;
	}
	pre {
		background-color: black;
		color: aqua;
	}
</style>
```

## src/routes/+page.svelte

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import { xsession } from '$lib/xsession';
	import { onDestroy, onMount } from 'svelte';
	let msgFromServer: any;

	$: xsessionEventID = xsession.on('push-data', (msg: { type: any; data: any }) => {
		msgFromServer = msg;
	});

	onDestroy(() => {
		xsession.off(xsessionEventID);
	});

	function moveToXSessionSendPage1() {
		goto('/1-xsession-send');
	}
	function moveToXSessionSendPage2() {
		goto('/2-xsession-send-static');
	}
	function moveToXSessionSendPage3() {
		goto('/3-xsession-send-server-side');
	}
</script>

<main>
	<h2>+page.svelte</h2>
	<h3>Message from server:</h3>
	<form>
		<button type="button" on:click={moveToXSessionSendPage1}
			>XSession.send() using same instance</button
		>
		<button type="button" on:click={moveToXSessionSendPage2}
			>XSession.send() making new instance</button
		>
		<button type="button" on:click={moveToXSessionSendPage3}
			>XSession.send() server-side sending</button
		>
	</form>
	<code lang="js">
		{#if msgFromServer}
			<pre>{JSON.stringify(msgFromServer, null, 2)}</pre>
		{:else}
			<em>no message</em>
		{/if}
	</code>
	<p />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: left;
		justify-content: center;
	}
	h2 {
		color: #dddddd;
	}
	code {
		padding: 1em;
		border-radius: 0.5em;
		background-color: black;
		color: aqua;
	}
	pre {
		background-color: black;
		color: aqua;
	}
	button {
		display: inline-block;
		padding: 0.5em 0.5em;
		margin: 0.25em 0.25em;
		border-radius: 0.2em;
		border: 0.1em solid rgba(87, 175, 172, 0.2);
		box-sizing: border-box;
		text-decoration: none;
		font-family: 'Roboto', sans-serif;
		font-weight: 300;
		text-shadow: 0 0.04em 0.04em rgba(0, 0, 0, 0.35);
		text-align: center;
		transition: all 0.2s;
		background-color: rgb(56, 58, 59);
		color: rgb(122, 227, 231);
	}
</style>
```

## src/routes/1-xsession-send/+page.svelte

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import { xsession } from '$lib/xsession';
	import { onDestroy, onMount } from 'svelte';
	let apiRespFromServer: any;
	let msgFromServer: any;

	$: xsessionEventID = xsession.on('push-data', (msg: { type: any; data: any }) => {
		msgFromServer = msg;
	});

	const sendMsgLogin = () => sendMsg('login');
	const sendMsgLogout = () => sendMsg('logout');
	const sendMsgUserInfoRead = () => sendMsg('user-{action:info}-{crud:read}');
	const sendMsgUserInfoUpdate = () => sendMsg('user-{action:info}-{crud:update}');
	const sendMsgUserAccountCreate = () => sendMsg('user-{action:account}-{crud:create}');
	const sendMsgUserAccountDelete = () => sendMsg('user-{action:account}-{crud:delete}');
	const sendMsgUserAccountRead = () => sendMsg('user-{action:account}-{crud:read}');
	const sendMsgUserAccountUpdate = () => sendMsg('user-{action:account}-{crud:update}');

	function sendMsg(msgType: string) {
		let msgData = {} as any;
		// action(CRUD): create, read, update, delete
		if (msgType === 'login') {
			msgData = { id: 'elonmusk', name: 'twitter', password: 'markzukenberg' };
		} else if (msgType === 'user-{action:info}-{crud:read}') {
			msgData = { id: 'elonmusk' };
		} else if (msgType === 'user-{action:info}-{crud:update}') {
			msgData = { id: 'elonmusk', name: 'twitter', password: 'X maybe SpaceX' };
		} else if (msgType === 'user-{action:account}-{crud:create}') {
			msgData = {
				id: 'elonmuskClone',
				name: 'Threads',
				password: 'I will kill you!!!',
				account: { curreny: 'USD', balance: 0 }
			};
		} else if (msgType === 'user-{action:account}-{crud:delete}') {
			msgData = { id: 'markzuckerberg', account: { id: 'millionaire', currency: 'USD' } };
		} else if (msgType === 'logout') {
			msgData = { id: 'elonmusk' };
		} else {
			console.error('Unknown msgType:', msgType, '=> (--)? 👎');
			return;
		}

		xsession
			.config({ url: 'http://localhost:3000/api' })
			.setHeaders({ 'x-session-test': '1234567890' })
			.send(msgType, msgData)
			.then((res: any) => {
				console.log('res', res, '=> 1) 👍');
				apiRespFromServer = res;
			})
			.catch((err: any) => {
				console.error('err', err, '=> 2) 👎');
				apiRespFromServer = err;
			});
	}

	onMount(() => {
		console.log('xsession-send => onMount()', xsession);
		xsession
			.config({ url: 'http://localhost:3000/api' })
			.setHeaders({ 'x-session-test': '1234567890' })
			.send('login', { id: 'elonmusk', name: 'twitter', password: 'markzukenberg' })
			.then((res: any) => {
				console.log('res', res, '=> 1) 👍');
				apiRespFromServer = res;
			})
			.catch((err: any) => {
				console.error('err', err, '=> 2) 👎');
				apiRespFromServer = err;
			});
	});

	onDestroy(() => {
		xsession.off(xsessionEventID);
		console.log('xsession-send => onDestroy()', xsession);
	});

	function moveToHome() {
		goto('/');
	}
</script>

<main>
	<h2>xsession-send/+page.svelte</h2>
	<h3>Message from server:</h3>
	<form>
		<button type="button" on:click={moveToHome}>Move to Home</button>
		<button type="button" on:click={sendMsgLogin}>Login</button>
		<button type="button" on:click={sendMsgLogout}>Logout</button>
		<button type="button" on:click={sendMsgUserInfoRead}>User Info CRUD/Read</button>
		<button type="button" on:click={sendMsgUserInfoUpdate}>User Info CRUD/Update</button>
		<button type="button" on:click={sendMsgUserAccountCreate}>User Account CRUD/Create</button>
		<button type="button" on:click={sendMsgUserAccountDelete}>User Account CRUD/Delete</button>
		<button type="button" on:click={sendMsgUserAccountRead}>User Account CRUD/Read</button>
		<button type="button" on:click={sendMsgUserAccountUpdate}>User Account CRUD/Update</button>
	</form>
	{#if apiRespFromServer}
		<code lang="js">
			<pre>xsession.send(): 

{JSON.stringify(apiRespFromServer, null, 2)}</pre>
		</code>
	{/if}
	<code lang="js">
		{#if msgFromServer}
			<pre>xsession.on(): 

{JSON.stringify(msgFromServer, null, 2)}</pre>
		{:else}
			<em>no message</em>
		{/if}
	</code>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: left;
		justify-content: center;
	}
	h2 {
		color: #dddddd;
	}
	code {
		padding: 1em;
		border-radius: 0.5em;
		background-color: black;
		color: aqua;
	}
	pre {
		background-color: black;
		color: aqua;
	}
	button {
		display: inline-block;
		padding: 0.5em 0.5em;
		margin: 0.25em 0.25em;
		border-radius: 0.2em;
		border: 0.1em solid rgba(87, 175, 172, 0.2);
		box-sizing: border-box;
		text-decoration: none;
		font-family: 'Roboto', sans-serif;
		font-weight: 300;
		text-shadow: 0 0.04em 0.04em rgba(0, 0, 0, 0.35);
		text-align: center;
		transition: all 0.2s;
		background-color: rgb(56, 58, 59);
		color: rgb(122, 227, 231);
	}
</style>
```

## src/routes/2-xsession-send-static/+page.svelte

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	//
	// 'xsession' is the XSession wrapper which is XSessionWrapper.
	//  - You can use xession without creating a new instance.
	//  - 'xsession' create a new instance class itself using xessioin.config().send() methods chain.
	//
	import { xsession } from 'x-session';
	let apiRespFromServer: any;

	const sendMsgLogin = () => sendMsg('login');
	const sendMsgLogout = () => sendMsg('logout');
	const sendMsgUserInfoRead = () => sendMsg('user-{action:info}-{crud:read}');
	const sendMsgUserInfoUpdate = () => sendMsg('user-{action:info}-{crud:update}');
	const sendMsgUserAccountCreate = () => sendMsg('user-{action:account}-{crud:create}');
	const sendMsgUserAccountDelete = () => sendMsg('user-{action:account}-{crud:delete}');
	const sendMsgUserAccountRead = () => sendMsg('user-{action:account}-{crud:read}');
	const sendMsgUserAccountUpdate = () => sendMsg('user-{action:account}-{crud:update}');

	function sendMsg(msgType: string) {
		let msgData = {} as any;
		// action(CRUD): create, read, update, delete
		if (msgType === 'login') {
			msgData = { id: 'elonmusk', name: 'twitter', password: 'markzukenberg' };
		} else if (msgType === 'user-{action:info}-{crud:read}') {
			msgData = { id: 'elonmusk' };
		} else if (msgType === 'user-{action:info}-{crud:update}') {
			msgData = { id: 'elonmusk', name: 'twitter', password: 'X maybe SpaceX' };
		} else if (msgType === 'user-{action:account}-{crud:create}') {
			msgData = {
				id: 'elonmuskClone',
				name: 'Threads',
				password: 'I will kill you!!!',
				account: { curreny: 'USD', balance: 0 }
			};
		} else if (msgType === 'user-{action:account}-{crud:delete}') {
			msgData = { id: 'markzuckerberg', account: { id: 'millionaire', currency: 'USD' } };
		} else if (msgType === 'logout') {
			msgData = { id: 'elonmusk' };
		} else {
			console.error('Unknown msgType:', msgType, '=> (--)? 👎');
			return;
		}

		if (msgType === 'login' || msgType === 'logout') {
			// You can use like the same using by creating new XSession(),
			xsession
				.config({ url: 'http://localhost:3000/api' })
				.setHeaders({ 'x-session-test': '1234567890' })
				.send(msgType, msgData)
				.then((res) => {
					console.log('res', res, '=> 1) 👍');
					apiRespFromServer = res;
				})
				.catch((err) => {
					console.error('err', err, '=> 2) 👎');
					apiRespFromServer = err;
				});
		} else {
			// And, you can use following way as well !!!
			xsession
				.config({
					apiKey: '1234567890', // don't use apiKey in browser that is client-side rendering. this is just for example.
					clientIPAddress: '127.0.0.1',
					method: 'POST',
					url: 'http://localhost:3000/api',
					headers: {
						'Content-Type': 'application/json',
						'x-session-test': 'abcde12345'
					}
				})
				.send(msgType, msgData)
				.then((res) => {
					console.log('res', res, '=> 1) 👍');
					apiRespFromServer = res;
				})
				.catch((err) => {
					console.error('err', err, '=> 2) 👎');
					apiRespFromServer = err;
				});
		}
	}

	function moveToHome() {
		goto('/');
	}
</script>

<main>
	<h2>xsession-send-static/+page.svelte</h2>
	<h3>Message from server:</h3>
	<form>
		<button type="button" on:click={moveToHome}>Move to Home</button>
		<button type="button" on:click={sendMsgLogin}>Login</button>
		<button type="button" on:click={sendMsgLogout}>Logout</button>
		<button type="button" on:click={sendMsgUserInfoRead}>User Info CRUD/Read</button>
		<button type="button" on:click={sendMsgUserInfoUpdate}>User Info CRUD/Update</button>
		<button type="button" on:click={sendMsgUserAccountCreate}>User Account CRUD/Create</button>
		<button type="button" on:click={sendMsgUserAccountDelete}>User Account CRUD/Delete</button>
		<button type="button" on:click={sendMsgUserAccountRead}>User Account CRUD/Read</button>
		<button type="button" on:click={sendMsgUserAccountUpdate}>User Account CRUD/Update</button>
	</form>
	{#if apiRespFromServer}
		<code lang="js">
			<pre>xsession.send(): 

{JSON.stringify(apiRespFromServer, null, 2)}</pre>
		</code>
	{/if}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: left;
		justify-content: center;
	}
	h2 {
		color: #dddddd;
	}
	code {
		padding: 1em;
		border-radius: 0.5em;
		background-color: black;
		color: aqua;
	}
	pre {
		background-color: black;
		color: aqua;
	}
	button {
		display: inline-block;
		padding: 0.5em 0.5em;
		margin: 0.25em 0.25em;
		border-radius: 0.2em;
		border: 0.1em solid rgba(87, 175, 172, 0.2);
		box-sizing: border-box;
		text-decoration: none;
		font-family: 'Roboto', sans-serif;
		font-weight: 300;
		text-shadow: 0 0.04em 0.04em rgba(0, 0, 0, 0.35);
		text-align: center;
		transition: all 0.2s;
		background-color: rgb(56, 58, 59);
		color: rgb(122, 227, 231);
	}
</style>
```

## src/routes/3-xsession-send-server-side/+page.server.ts

```ts
//
// 'xsession' is the XSession wrapper which is XSessionWrapper.
//  - You can use xession without creating a new instance.
//  - 'xsession' create a new instance class itself using xessioin.config().send() methods chain.
//
import { xsession } from 'x-session';

export const prerender = false;
export const ssr = true;
export const csr = true;
const pageTitle = 'XSession Send Server Side - +page.server.ts';

/** @type {import('./$types').PageServerLoad} */
export async function load(event: any) {
	// Data load from the API server
	let apiRespFromServer = undefined;
	const msgType = 'user-{action:info}-{crud:read}';
	const msgData = { id: 'elonmusk' };
	await xsession
		.config({
			cookies: event.cookies.getAll(),
			clientIPAddress: event.getClientAddress(),
			url: 'http://localhost:3000/api'
		})
		.send(msgType, msgData)
		.then((res: any) => {
			console.log('\n\n', pageTitle, 'load() => res', res, '=> 1) 👍');
			apiRespFromServer = res;
		})
		.catch((err: any) => {
			console.error('\n\n', pageTitle, 'load() => err', err, '=> 2) 👎');
		});

	return {
		fromAPIServer: apiRespFromServer,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		data: apiRespFromServer.msgData.data
	};
}

/** @type {import('./$types').Actions} */
export const actions: import('./$types').Actions = {
	// named form action : login
	login: async (event: any) => {
		// user sample codes like below
		const formData = await event.request.formData();
		const formDataSerialized = Object.fromEntries(formData);

		let missing = false;
		const missingData = { missingEmail: false, missingPassword: false };
		const email = formData.get('email');
		const password = formData.get('password');
		if (!email) {
			missingData.missingEmail = true;
		}
		if (!password) {
			missingData.missingPassword = true;
		}
		Object.entries(missingData).forEach(([key, value]) => value && (missing = true));
		if (missing) {
			return { success: false, ...missingData, ...formDataSerialized };
		}

		// Data load from the API server
		let apiRespFromServer = undefined;
		const msgType = 'login';
		const msgData = { ...formDataSerialized, name: 'Elon Musk' };
		await xsession
			.config({
				cookies: event.cookies.getAll(),
				clientIPAddress: event.getClientAddress(),
				url: 'http://localhost:3000/api'
			})
			.send(msgType, msgData)
			.then((res: any) => {
				console.log('\n\n', pageTitle, 'actions(login) => res', res, '=> 1) 👍');
				apiRespFromServer = res;
			})
			.catch((err: any) => {
				console.error('\n\n', pageTitle, 'actions(login) => err', err, '=> 2) 👎');
			});

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return { success: true, name: apiRespFromServer?.msgData?.data?.name };
	}
};
```
