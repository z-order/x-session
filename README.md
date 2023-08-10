# `x-session`

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
```

## Refs: Project Tree Structure

```r
x-session/
├─ src/
│  ├─ browser/
│  │  ├─ index.ts   # Browser-specific TypeScript code
│  ├─ node/
│  │  ├─ index.ts   # Node-specific TypeScript code
│  ├─ shared/
│  │  ├─ index.ts   # TypeScript code common to both Node and browser
├─ dist/
│  ├─ browser/      # Output directory for browser-specific code
│  ├─ node/         # Output directory for Node-specific code
├─ types/
│  ├─ browser/      # Output directory for browser-specific types
│  ├─ node/         # Output directory for Node-specific types
├─ tsconfig.json
└─ package.json
```

## To dos

`x-session` module on RESTful API Calls

- [O] x-session browser module
- [O] x-session node module on SvelteKit(+[page.]server.ts)

`x-session` module on Push Event(SSE)

- [O] x-session browser module
- [O] x-session node module on Push Server(SSE)

## Refs: source app.html

```js
    <!-- Add this script to collect browser information -->
    <script>
      window.addEventListener('load', () => {
        // Collect browser info
        const browserInfo = {
          // browser information...
          browserInfo: 'browser information...Done!'
        };

        // Store browser info in cookie or localStorage
        localStorage.setItem('browserInfo', JSON.stringify(browserInfo));
        let cookie = {
          name: 'browserInfo',
          value: encodeURIComponent(JSON.stringify(browserInfo)),
          options: {
            domain: 'localhost',
            path: '/',
            expires: `${new Date(Date.now() + 3600000).toUTCString()}`,
            httpOnly: true,
            sameSite: 'Strict',
            secure: false,
            maxAge: 3600,
          },
        };
        document.cookie = `${cookie.name}=${cookie.value}; expires=${cookie.options.expires}; path=${cookie.options.path}; domain=${cookie.options.domain}; secure=${cookie.options.secure}; samesite=${cookie.options.sameSite}; max-age=${cookie.options.maxAge}; httponly=${cookie.options.httpOnly};`;
      });
      document.cookie = 'browserInfo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost; secure; samesite=Strict; max-age=0; httponly;';
    </script>
```
