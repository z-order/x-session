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
