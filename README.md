# `x-session` (Beta)

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
                                  Push events from API server
```

SSR on SvelteKit

```ts
//
// file: src/routes/+layout.server.ts
//

import { xsession } from 'x-session';

/** @type {import('./$types').PageServerLoad} */
export async function load(event: any) {
  const resp = await xsession.initSvelteSSR({
    apiKey: 'my-api-key',
    cookies: event.cookies,
    clientIPAddress: event.getClientAddress(),
    url: 'http://localhost:3000/api',
    msgDebug: true,
  });

  return { xsession: resp };
}
```

CSR on SvelteKit

```ts
//
// file: src/lib/xsession.ts
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

// msgDebug: true, you can see all messages in browser console
export const xsession: XSession = new XSession({
  url: 'http://localhost:3000/api',
  msgDebug: true,
});
```

---

```ts
//
// file: src/routes/+layout.svelte
//
<script lang="ts">

export let data: any;
import { xsession } from "$lib/xsession";

$: xsessionRespFromSSR = data.xsession;

onMount(() => {

  const resp = await xsession.initSvelteCSR(xsessionRespFromSSR);
  if (!resp) {
    // The x-session is not started yet, so, you must call initSvelteSSR() method next.
    // Causes all the 'load' functions to re-run
    invalidateAll();
  }

});

</script>
```

## Refs: Project Tree Structure

```r
x-session/
├─ src/
│  ├─ browser/
│  │  ├─ index.ts   # Browser-specific TypeScript code
│  │  ├─ ...
│  ├─ node/
│  │  ├─ index.ts   # Node-specific TypeScript code
│  │  ├─ ...
│  ├─ shared/
│  │  ├─ index.ts   # TypeScript code common to both Node and browser
│  │  ├─ ...
├─ examples/
│  ├─ browser-esmodules/
│  │  ├─ ...
│  ├─ browser-rollup/
│  │  ├─ ...
│  ├─ browser-sveltekit/
│  │  ├─ ...
│  ├─ browser-webpack/
│  │  ├─ ...
├─ npmjs/
│  ├─ x-session/
│  │  ├─ dist
├─ dist/
│  ├─ browser/      # Output directory for browser-specific code
│  ├─ node/         # Output directory for Node-specific code
├─ tsconfig.json
└─ package.json
```

## Using `npm link` for Local Development

The `npm link` command allows you to locally develop and test an npm package without having to publish it to the npm registry. This is especially useful for testing changes to a library in a real-world scenario, such as in an application that uses the library.

```bash
# Linking the Library:

# First, navigate to the directory of the library/package you're developing.
cd path/to/x-session

# Run the npm link command in this directory. This essentially creates a global symlink to this package.
npm link

# Linking to an Application:

# Now, navigate to the directory of the application where you want to use the linked version of your library.
cd path/to/your-application

# Link your application to the globally linked version of your library with the following command:
npm link x-session

# Unlinking:

# When you're done testing and want to revert back to the version of x-session in the npm registry (or simply remove the symlinked version), you can "unlink".

# First, go to your application directory:
cd path/to/your-application

# Then run:
npm unlink x-session

# Also, remember to navigate back to your x-session directory and run npm unlink there as well to remove the global symlink.
cd path/to/x-session
npm unlink
```

**Things to Remember**:

- While using `npm link`, remember that you're working with a symlink. Changes made to the library will immediately reflect in the linked application without needing to reinstall or update the package.
- `npm link` can sometimes cause issues with packages that have native bindings or when using tools that don't handle symlinks well. If you face any issues, consider unlinking and using the published version of the package.

## Modules for the browsers(commonjs and esm) and nodejs(commonjs and esm)

`x-session` module on RESTful API Calls

- [O] x-session browser module
- [O] x-session node module on SvelteKit(+[page.]server.ts)

`x-session` module on Push Event(SSE)

- [O] x-session browser module
- [O] x-session node module on Push Server(SSE)
