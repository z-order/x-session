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
