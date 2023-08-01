<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { xsession } from '$lib/index';
	let msgFromServer: object | null = null;
	//
	// XSession: create instance, on, start, close
	//
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
			msgFromServer = msg;
			switch (msg.type) {
				case 'sticker':
					console.log('on:message(sticker)', msg.data);
					break;
				case 'text':
					console.log('on:message(text)', msg.data);
					break;
				case 'push-data':
					console.log('on:message(push-data)', msg.data);
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
		xsession.on('push-data', (msg: { type: any; data: any }) =>
			console.log('on:push-data', msg.type, msg.data, '=> 👍')
		);
	}
	onMount(() => {
		xsession.start();
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
