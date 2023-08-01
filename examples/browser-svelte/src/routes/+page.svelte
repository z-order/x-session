<script lang="ts">
	import { xsession } from '$lib/xsession';
	let msgFromServer: any;

	$: {
		xsession.on('push-data', (msg: { type: any; data: any }) => {
			msgFromServer = msg;
		});
	}
</script>

<main>
	<h1>+page.svelte</h1>
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
