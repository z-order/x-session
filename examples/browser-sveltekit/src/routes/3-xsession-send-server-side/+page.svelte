<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: any;
	/** @type {import('./$types').ActionData} */
	export let form: any;
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	console.log(
		'\n\n',
		'routes/3-xsession-send-server-side/+page.svelte',
		'data =>',
		data,
		'form =>',
		form
	);

	let postActionWaiting = false;
	function setPostActionWaiting(waiting: boolean) {
		if (waiting) {
			// If pastActionWaiting is true, it needs to be rendered immediately.
			// Nevertheless, something resize window actions to work expected it must be called after rendered.
			// So, 50ms are enough naturally.
			setTimeout(() => {
				postActionWaiting = waiting;
			}, 50);
		} else {
			// If pastActionWaiting is false, it needs to be rendered delayed to avoid blinking popup.
			// So, 500ms are enough naturally.
			setTimeout(() => {
				postActionWaiting = waiting;
				// Do something resize window here.
				// ...
			}, 500);
		}
	}

	function moveToHome() {
		goto('/');
	}
</script>

<main>
	<h2>xsession-send-servere-side/+page.svelte</h2>
	<h3>Message from server:</h3>
	<form>
		<button type="button" on:click={moveToHome}>Move to Home</button>
	</form>
	<div class="form-frame">
		<p>Form Actions with use:enhance</p>
		<!-- use:enhance will emulate the browser-native behaviour, just without the full-page reloads -->
		<form
			method="POST"
			action="?/login"
			use:enhance={() => {
				setPostActionWaiting(true);
				return async ({ update }) => {
					await update();
					setPostActionWaiting(false);
				};
			}}
		>
			<label>
				Email <input
					name="email"
					class="input"
					type="email"
					placeholder="sample@email.com"
					value={form?.email ?? ''}
				/>
				{#if form?.missingEmail}<p class="error">The email field is required!</p>{/if}
			</label>
			<label>
				Password <input
					name="password"
					class="input"
					type="password"
					placeholder="Password"
					value={form?.password ?? ''}
				/>
				{#if form?.missingPassword}<p class="error">The password field is required!</p>{/if}
			</label>
			<button class="btn" disabled={postActionWaiting}>Login</button>
			<button class="btn" disabled={postActionWaiting} formaction="?/login"
				>Another login button.</button
			>
		</form>
		<div class="form-popup">
			{#if postActionWaiting}
				<p>Waiting for form action to complete...</p>
			{/if}
		</div>
		{#if form?.success}
			<!-- this message is ephemeral; it exists because the page was rendered in
			 response to a form submission. it will vanish if the user reloads -->
			<p>Successfully logged in! Welcome back, {form?.name}</p>
		{/if}
	</div>
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
