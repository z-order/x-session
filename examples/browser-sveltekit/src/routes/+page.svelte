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
