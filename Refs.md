# `x-session`

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
