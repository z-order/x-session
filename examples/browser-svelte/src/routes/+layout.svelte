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
