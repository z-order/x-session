export const prerender = false;
export const ssr = true;
export const csr = true;

/** @type {import('./$types').PageServerLoad} */
export function load(event: any) {
	// Data load from the API server
	// ...
	return {
		user: event.locals.user
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
		let missingData = { missingEmail: false, missingPassword: false };
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

		// Redirects (and errors) work exactly the same as in load:
		if (email === 'admin@test.com' && password === 'admin') {
			// redirect to /admin
			throw redirect(303, '/admin');
		}

		return { success: true, name: user };
	}
};
