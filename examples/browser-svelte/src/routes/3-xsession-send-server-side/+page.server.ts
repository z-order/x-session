//
// 'xsession' is the XSession wrapper which is XSessionWrapper.
//  - You can use xession without creating a new instance.
//  - 'xsession' create a new instance class itself using xessioin.config().send() methods chain.
//
import { xsession } from 'x-session';

export const prerender = false;
export const ssr = true;
export const csr = true;

/** @type {import('./$types').PageServerLoad} */
export function load(event: any) {
	console.log('event', event);
	console.log('event.cookies.getAll', event.cookies.getAll());
	console.log('event.cookies.serialize', event.cookies.serialize());
	const cookies = event.cookies.getAll();
	cookies.forEach((cookie: any) => {
		console.log('cookie.name', cookie.name, 'cookie.value', cookie.value);
	});

	// Data load from the API server
	let apiRespFromServer = undefined;
	const msgType = 'user-{action:info}-{crud:read}';
	const msgData = { id: 'elonmusk' };
	xsession
		.config({
			cookies: event.cookies.getAll(),
			clientIPAddress: event.getClientAddress(),
			url: 'http://localhost:3000/api'
		})
		.send(msgType, msgData)
		.then((res: any) => {
			console.log('res', res, '=> 1) 👍');
			apiRespFromServer = res;
		})
		.catch((err: any) => {
			console.error('err', err, '=> 2) 👎');
		});
	return {
		user: apiRespFromServer
	};
}

/** @type {import('./$types').Actions} */
export const actions: import('./$types').Actions = {
	// named form action : login
	login: async ({ cookies, request, url }) => {
		// login sample codes like below
		const formData = await request.formData();
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
			return fail(400, { ...missingData, ...formDataSerialized });
		}

		// A sample code of getting user information form DB
		const user: string = await (async function getUserFromDB(email: string) {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve('User0001');
				}, 1000);
			});
		})(email as string);

		if (!user) {
			return fail(401, { incorrect: true, message: 'Unauthorized' });
		}

		// A sample code of getting session id form DB
		const newSessionId = await (async function createSessionFromDB(user: string) {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(`${user}'s session-id is here ...`);
				}, 1000);
			});
		})(user as string);

		if (!newSessionId) {
			return fail(403, { incorrect: true, message: 'Forbidden' });
		}

		// TODO: set the session id to the cookie and so on here.
		// ...

		return { success: true, name: user };
	}
};
