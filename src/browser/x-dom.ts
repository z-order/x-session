/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

let _xdomDebug = false;

class XDom {
  public static __CLASSNAME__ = 'XDom';

  public static setDebug(debug: boolean) {
    _xdomDebug = debug;
  }

  /**
   *
   * @param backgroundColor Background color for the full-screen : blue, red, green, yellow, black, white, etc. (Default: '#303030')
   * @reference Check the full-screen mode on your browser Refs) https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
   * @returns {void}
   */
  public static InitXDomElements(_backgroundColor?: string) {
    if (typeof document === 'undefined') return;
    if (typeof window === 'undefined') return;

    // Style the page
    const backgroundColor = _backgroundColor ? _backgroundColor : '#303030';
    let styleText = `:-webkit-full-screen { background-color: ${backgroundColor}; } \n`; // Chrome, Safari and Opera syntax
    styleText += `:-moz-full-screen { background-color: ${backgroundColor}; } \n`; // Firefox syntax
    styleText += `:-ms-fullscreen { background-color: ${backgroundColor}; } \n`; // IE11 or Edge syntax
    styleText += `:fullscreen { background-color: ${backgroundColor}; } \n`; // Standard syntax
    /**
     * // Example: How to style a button, you can add your own styles here for all your elements
     *
     * styleText += `button { padding: 20px; font-size: 20px; } \n`; // Style the button
     *
     */
    XDom.setStyle('xdom$$Init', styleText);

    // Create xdom object
    window.xdom = window.xdom || {};

    // Fullscreen functions: you can call these functions from your code,
    // for example:
    // window.xdom.openFullscreen(); // Open fullscreen
    // window.xdom.closeFullscreen(); // Close fullscreen
    window.xdom.openFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(); // Safari
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen(); // IE11 or Edge
      }
    };
    window.xdom.closeFullscreen = () => {
      const elem = document.documentElement;
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen(); // Safari
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen(); // IE11 or Edge
      }
    };
    document.addEventListener('fullscreenchange', function () {
      if (document.fullscreenElement) {
        // console.log('Entered fullscreen mode');
      } else {
        // console.log('Exited fullscreen mode');
      }
    });

    // 1. Create the 'xdom$$openFullscreen' button
    const openFullscreenButton = document.createElement('button');
    openFullscreenButton.id = 'xdom$$openFullscreen';
    openFullscreenButton.innerText = 'Open Fullscreen';
    openFullscreenButton.style.visibility = 'hidden'; // 'visible' or 'hidden';
    openFullscreenButton.style.position = 'absolute';
    openFullscreenButton.style.color = 'cyan';
    openFullscreenButton.style.left = `20px`;
    openFullscreenButton.style.top = `20px`;
    openFullscreenButton.style.width = `150px`;
    openFullscreenButton.style.height = `120px`;
    openFullscreenButton.style.overflow = 'auto';
    openFullscreenButton.style.zIndex = '999';

    // 2. Create the 'xdom$$closeFullscreen' button
    const closeFullscreenButton = document.createElement('button');
    closeFullscreenButton.id = 'xdom$$closeFullscreen';
    closeFullscreenButton.innerText = 'Close Fullscreen';
    closeFullscreenButton.style.visibility = 'hidden'; // 'visible' or 'hidden';
    closeFullscreenButton.style.position = 'absolute';
    closeFullscreenButton.style.color = 'cyan';
    closeFullscreenButton.style.left = `190px`;
    closeFullscreenButton.style.top = `20px`;
    closeFullscreenButton.style.width = `150px`;
    closeFullscreenButton.style.height = `120px`;
    openFullscreenButton.style.overflow = 'auto';
    openFullscreenButton.style.zIndex = '999';

    // 3. Append both buttons to the body (or another container of your choice)
    document.body.appendChild(openFullscreenButton);
    document.body.appendChild(closeFullscreenButton);

    // 4. Add event listeners
    document
      .getElementById('xdom$$openFullscreen')
      ?.addEventListener('click', window.xdom.openFullscreen);
    document
      .getElementById('xdom$$closeFullscreen')
      ?.addEventListener('click', window.xdom.closeFullscreen);

    // You can call the function on DOMContentLoaded or wherever it suits your needs
    document.addEventListener('DOMContentLoaded', function () {
      XDom.setMetaTags();
    });
  }

  public static isLocalhost() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // window.location.host : "host.domain.com:3000"
      // window.location.hostname : "host.domain.com"
      // window.location.href : "https://host.domain.com:3000/"
      // window.location.origin : "https://host.domain.com:3000"
      return true;
    }
    return false;
  }

  public static isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for Android
    if (/android/i.test(userAgent)) {
      return true;
    }

    // Check for iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return true;
    }

    return false;
  }

  public static isIOS() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return true;
    }
  }

  public static isAndroid() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for Android
    if (/android/i.test(userAgent)) {
      return true;
    }
  }

  public static isChrome() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for Chrome
    if (/Chrome/i.test(userAgent)) {
      return true;
    }
  }

  public static isSafari() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for Safari
    if (/Safari/i.test(userAgent)) {
      return true;
    }
  }

  public static isFirefox() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for Firefox
    if (/Firefox/i.test(userAgent)) {
      return true;
    }
  }

  public static isIE() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for IE
    if (/MSIE/i.test(userAgent)) {
      return true;
    }
  }

  public static isEdge() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for Edge
    if (/Edge/i.test(userAgent)) {
      return true;
    }
  }

  public static isOpera() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for Opera
    if (/Opera/i.test(userAgent)) {
      return true;
    }
  }

  public static isWindows() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for Windows
    if (/Windows/i.test(userAgent)) {
      return true;
    }
  }

  public static isMac() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for Mac
    if (/Mac/i.test(userAgent)) {
      return true;
    }
  }

  public static isLinux() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for Linux
    if (/Linux/i.test(userAgent)) {
      return true;
    }
  }

  public static getBrowser() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for Chrome
    if (/Chrome/i.test(userAgent)) {
      return 'Chrome';
    }

    // Check for Safari
    if (/Safari/i.test(userAgent)) {
      return 'Safari';
    }

    // Check for Firefox
    if (/Firefox/i.test(userAgent)) {
      return 'Firefox';
    }

    // Check for IE
    if (/MSIE/i.test(userAgent)) {
      return 'IE';
    }

    // Check for Edge
    if (/Edge/i.test(userAgent)) {
      return 'Edge';
    }

    // Check for Opera
    if (/Opera/i.test(userAgent)) {
      return 'Opera';
    }

    // Check for Android
    if (/android/i.test(userAgent)) {
      return 'Android';
    }

    // Check for iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'iOS';
    }

    // Check for Windows
    if (/Windows/i.test(userAgent)) {
      return 'Windows';
    }

    // Check for Mac
    if (/Mac/i.test(userAgent)) {
      return 'Mac';
    }

    // Check for Linux
    if (/Linux/i.test(userAgent)) {
      return 'Linux';
    }

    // Check for unknown
    return 'unknown';
  }

  public static getBrowserVersion() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for Chrome
    if (/Chrome/i.test(userAgent)) {
      return userAgent.match(/Chrome\/([\d.]+)/)[1];
    }

    // Check for Safari
    if (/Safari/i.test(userAgent)) {
      return userAgent.match(/Safari\/([\d.]+)/)[1];
    }

    // Check for Firefox
    if (/Firefox/i.test(userAgent)) {
      return userAgent.match(/Firefox\/([\d.]+)/)[1];
    }

    // Check for IE
    if (/MSIE/i.test(userAgent)) {
      return userAgent.match(/MSIE\/([\d.]+)/)[1];
    }

    // Check for Edge
    if (/Edge/i.test(userAgent)) {
      return userAgent.match(/Edge\/([\d.]+)/)[1];
    }

    // Check for Opera
    if (/Opera/i.test(userAgent)) {
      return userAgent.match(/Opera\/([\d.]+)/)[1];
    }

    // Check for Android
    if (/android/i.test(userAgent)) {
      return userAgent.match(/Android\s([\d.]+)/)[1];
    }

    // Check for iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return userAgent.match(/OS\s([\d_]+)/)[1];
    }

    // Check for Windows
    if (/Windows/i.test(userAgent)) {
      return userAgent.match(/Windows\s([\d.]+)/)[1];
    }

    // Check for Mac
    if (/Mac/i.test(userAgent)) {
      return userAgent.match(/Mac\s([\d.]+)/)[1];
    }

    // Check for Linux
    if (/Linux/i.test(userAgent)) {
      return userAgent.match(/Linux\s([\d.]+)/)[1];
    }

    // Check for unknown
    return 'unknown';
  }

  public static getBrowserLanguage() {
    const language = navigator.language || navigator.userLanguage;
    return language;
  }

  public static getPlatform() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for Android
    if (/android/i.test(userAgent)) {
      return 'Android';
    }

    // Check for iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'iOS';
    }

    // Check for Windows
    if (/Windows/i.test(userAgent)) {
      return 'Windows';
    }

    // Check for Mac
    if (/Mac/i.test(userAgent)) {
      return 'Mac';
    }

    // Check for Linux
    if (/Linux/i.test(userAgent)) {
      return 'Linux';
    }

    // Check for unknown
    return 'unknown';
  }

  public static isFullscreen() {
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement || // Chrome, Safari and Opera
      document.mozFullScreenElement || // Firefox
      document.msFullscreenElement // IE/Edge
    ) {
      // 'The document is in fullscreen mode.'
      return true;
    } else {
      // 'The document is not in fullscreen mode.'
      return false;
    }
  }

  public static async openFullscreen() {
    !XDom.isFullscreen() && window.xdom?.openFullscreen();
  }

  public static closeFullscreen() {
    XDom.isFullscreen() && window.xdom?.closeFullscreen();
  }

  public static enableFullscreenButton(showButton: boolean) {
    document.getElementById('xdom$$openFullscreen')!.style.visibility = showButton
      ? 'visible'
      : 'hidden';
    document.getElementById('xdom$$closeFullscreen')!.style.visibility = showButton
      ? 'visible'
      : 'hidden';
  }

  public static enableFullscreen() {
    // Set the viewport properties
    XDom.appendMeta(
      'viewport',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    );

    // Set the body styles
    document.body.style.margin = '0';
    document.body.style.height = '100vh';
    document.body.style.overflow = 'hidden';

    // Scroll a bit to hide the address bar
    window.scrollTo(0, 1);

    // Add a listener to resize events to maintain fullscreen
    window.addEventListener('resize', function () {
      window.scrollTo(0, 1);
    });
  }

  public static fullscreenEnabled() {
    return document.fullscreenEnabled;
  }

  public static openFullscreenGDesktop(containerId: string, url: string) {
    const containerHtmlElement = document.getElementById(containerId) as HTMLElement;
    if (containerHtmlElement === null || containerHtmlElement === undefined) {
      return;
    }

    XDom.openFullscreen();

    const iframe = document.createElement('iframe');
    const iframeId = `xdom$$iframe-${containerId}`;
    iframe.src = url; // Replace with your desired URL
    iframe.id = iframeId;
    // Set style properties directly
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.position = 'absolute';
    iframe.style.top = '0px';
    iframe.style.left = '0px';
    document.body.appendChild(iframe);

    containerHtmlElement.appendChild(iframe);

    window.addEventListener('beforeunload', () => {
      if (iframe && containerHtmlElement.contains(iframe)) {
        containerHtmlElement.removeChild(iframe);
      }
    });
  }

  public static openFullscreenGAndroid(containerId: string, url: string) {
    XDom.openFullscreenGDesktop(containerId, url);
  }

  public static openFullscreenGiOS(containerId: string, url: string) {
    let svgArrowUpAnim =
      '<svg width="50" height="120" viewBox="0 0 50 120" fill="none" xmlns="http://www.w3.org/2000/svg"> \
		<g> \
		<animateTransform  \
			attributeName="transform" \
			type="translate" \
			from="0 38" \
			to="0 0" \
			dur="1.5s" \
			repeatCount="indefinite" \
		/> \
		<path d="M-2.05218e-06 61.5258C-3.18556e-06 48.5614 11.1929 38.0516 25 38.0516C38.8071 38.0516 50 48.5614 50 61.5258C50 74.4903 38.8071 85 25 85C11.1929 85 -9.18791e-07 74.4903 -2.05218e-06 61.5258Z" fill="#7EE684"/> \
		<path d="M26.7678 1.23223C25.7915 0.255923 24.2085 0.255923 23.2322 1.23223L7.32233 17.1421C6.34602 18.1184 6.34602 19.7014 7.32233 20.6777C8.29864 21.654 9.88155 21.654 10.8579 20.6777L25 6.53553L39.1421 20.6777C40.1184 21.654 41.7014 21.654 42.6777 20.6777C43.654 19.7014 43.654 18.1184 42.6777 17.1421L26.7678 1.23223ZM27.5 63L27.5 3L22.5 3L22.5 63L27.5 63Z" fill="#7EE684"/>	\
		</g> \
		</svg>';
    let svgArrowDownAnim =
      '<svg width="50" height="120" viewBox="0 0 50 120" fill="none" xmlns="http://www.w3.org/2000/svg"> \
		<g> \
        <animateTransform \
            attributeName="transform" \
            type="translate" \
            from="0 0" \
            to="0 38" \
            dur="1.5s" \
            repeatCount="indefinite" \
        /> \
		<path d="M50 23.4742C50 36.4386 38.8071 46.9484 25 46.9484C11.1929 46.9484 -6.37113e-06 36.4386 -4.10436e-06 23.4742C-1.83758e-06 10.5097 11.1929 1.95703e-06 25 4.37114e-06C38.8071 6.78525e-06 50 10.5098 50 23.4742Z" fill="#7EE684"/> \
		<path d="M23.2322 83.7678C24.2085 84.7441 25.7914 84.7441 26.7678 83.7678L42.6777 67.8579C43.654 66.8816 43.654 65.2986 42.6777 64.3223C41.7013 63.346 40.1184 63.346 39.1421 64.3223L25 78.4645L10.8579 64.3223C9.88154 63.346 8.29863 63.346 7.32232 64.3223C6.34601 65.2986 6.34601 66.8815 7.32232 67.8579L23.2322 83.7678ZM22.5 22L22.5 82L27.5 82L27.5 22L22.5 22Z" fill="#7EE684"/> \
  	 	</g> \
		</svg>';

    const containerHtmlElement = document.getElementById(containerId) as HTMLElement;
    if (containerHtmlElement === null || containerHtmlElement === undefined) {
      return;
    }

    if (!XDom.isSafari()) {
      return XDom.openFullscreenGDesktop(containerId, url);
    }

    const iframe = document.createElement('iframe');
    const iframeId = `xdom$$iframe-${containerId}`;
    iframe.src = url; // Replace with your desired URL
    iframe.id = iframeId;
    // Set style properties directly
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.position = 'absolute';
    iframe.style.top = '100px';
    iframe.style.left = '0';
    document.body.appendChild(iframe);

    const divDownArrow = document.createElement('div');
    divDownArrow.id = 'xdom$$divDownArrow';
    divDownArrow.style.width = '50px';
    divDownArrow.style.height = '150px';
    divDownArrow.style.border = 'none';
    divDownArrow.style.position = 'absolute';
    divDownArrow.style.top = '10%'; // 80% -> 10% : 80% for the position of bottom, 10% for the position of top
    divDownArrow.style.left = '45%';
    divDownArrow.style.zIndex = '100';
    divDownArrow.style.display = 'none';
    divDownArrow.innerHTML = svgArrowDownAnim;

    const divUpArrow = document.createElement('div');
    divUpArrow.id = 'xdom$$divUpArrow';
    divUpArrow.style.width = '50px';
    divUpArrow.style.height = '150px';
    divUpArrow.style.border = 'none';
    divUpArrow.style.position = 'absolute';
    divUpArrow.style.top = '8%';
    divUpArrow.style.left = '45%';
    divUpArrow.style.zIndex = '100';
    divUpArrow.style.display = 'none';
    divUpArrow.innerHTML = svgArrowUpAnim;

    containerHtmlElement.appendChild(iframe);
    containerHtmlElement.appendChild(divDownArrow);
    containerHtmlElement.appendChild(divUpArrow);

    setTimeout(() => {
      divUpArrow.style.display = 'block';
    }, 2000);

    const bigGap = window.outerHeight - window.innerHeight;
    let lastWindowHeight = window.innerHeight;

    window.addEventListener('resize', () => {
      // Landscape mode
      if (window.innerHeight < window.innerWidth) {
        // Set style properties directly
        iframe.style.width = '100vw';
        iframe.style.height = '100vh';
        iframe.style.border = 'none';
        iframe.style.position = 'absolute';
        iframe.style.top = '0px';
        iframe.style.left = '0px';
        return;
      } else {
        // Portrait mode
        const scrollY = window.scrollY; // description: https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
        const currentGap = window.outerHeight - window.innerHeight;
        const iframe = document.getElementById(iframeId) as HTMLElement;
        const currentWindowHeight = window.innerHeight;
        if (currentWindowHeight > lastWindowHeight && currentGap >= bigGap) {
          //console.log("iOS Browser bottom bar might be hidden now");
          iframe.style.height = '100vh';
          divDownArrow.style.display = 'none'; // https://www.w3schools.com/cssref/pr_class_display.asp
          divUpArrow.style.display = 'block';
        } else if (currentWindowHeight > lastWindowHeight && currentGap < bigGap) {
          //console.log("iOS Browser bottom bar might be hidden now");
          divDownArrow.style.display = 'none';
          divUpArrow.style.display = 'none';
        } else if (currentWindowHeight < lastWindowHeight && currentGap >= bigGap) {
          //console.log("iOS Browser bottom bar might be visible now");
          iframe.style.top = '100px';
          iframe.style.left = '0';
          iframe.style.height = '100vh';
          if (scrollY > 80) {
            divDownArrow.style.display = 'block';
            divUpArrow.style.display = 'none';
          } else {
            divDownArrow.style.display = 'none';
            divUpArrow.style.display = 'block';
          }
          /* If you want to use down arrow in the bottom, use this code
          iframe.style.height = '80vh';
          divDownArrow.style.display = 'block';
          divUpArrow.style.display = 'none';
          */
        } else if (currentWindowHeight < lastWindowHeight && currentGap < bigGap) {
          //console.log("iOS Browser bottom bar might be visible now");
          divDownArrow.style.display = 'none';
          divUpArrow.style.display = 'none';
        }
        lastWindowHeight = currentWindowHeight;
      }
    });
    window.addEventListener('beforeunload', () => {
      if (iframe && containerHtmlElement.contains(iframe)) {
        containerHtmlElement.removeChild(iframe);
      }
    });
  }

  public static _openFullscreenGiOS_(containerId: string, url: string) {
    let svgArrowUpAnim =
      '<svg width="50" height="120" viewBox="0 0 50 120" fill="none" xmlns="http://www.w3.org/2000/svg"> \
		<g> \
		<animateTransform  \
			attributeName="transform" \
			type="translate" \
			from="0 30" \
			to="0 -20" \
			dur="1.5s" \
			repeatCount="indefinite" \
		/> \
		<path d="M-2.05218e-06 61.5258C-3.18556e-06 48.5614 11.1929 38.0516 25 38.0516C38.8071 38.0516 50 48.5614 50 61.5258C50 74.4903 38.8071 85 25 85C11.1929 85 -9.18791e-07 74.4903 -2.05218e-06 61.5258Z" fill="#7EE684"/> \
		<path d="M26.7678 1.23223C25.7915 0.255923 24.2085 0.255923 23.2322 1.23223L7.32233 17.1421C6.34602 18.1184 6.34602 19.7014 7.32233 20.6777C8.29864 21.654 9.88155 21.654 10.8579 20.6777L25 6.53553L39.1421 20.6777C40.1184 21.654 41.7014 21.654 42.6777 20.6777C43.654 19.7014 43.654 18.1184 42.6777 17.1421L26.7678 1.23223ZM27.5 63L27.5 3L22.5 3L22.5 63L27.5 63Z" fill="#7EE684"/>	\
		</g> \
		</svg>';
    let svgArrowDownAnim =
      '<svg width="50" height="120" viewBox="0 0 50 120" fill="none" xmlns="http://www.w3.org/2000/svg"> \
		<g> \
        <animateTransform \
            attributeName="transform" \
            type="translate" \
            from="0 0" \
            to="0 50" \
            dur="1.5s" \
            repeatCount="indefinite" \
        /> \
		<path d="M50 23.4742C50 36.4386 38.8071 46.9484 25 46.9484C11.1929 46.9484 -6.37113e-06 36.4386 -4.10436e-06 23.4742C-1.83758e-06 10.5097 11.1929 1.95703e-06 25 4.37114e-06C38.8071 6.78525e-06 50 10.5098 50 23.4742Z" fill="#7EE684"/> \
		<path d="M23.2322 83.7678C24.2085 84.7441 25.7914 84.7441 26.7678 83.7678L42.6777 67.8579C43.654 66.8816 43.654 65.2986 42.6777 64.3223C41.7013 63.346 40.1184 63.346 39.1421 64.3223L25 78.4645L10.8579 64.3223C9.88154 63.346 8.29863 63.346 7.32232 64.3223C6.34601 65.2986 6.34601 66.8815 7.32232 67.8579L23.2322 83.7678ZM22.5 22L22.5 82L27.5 82L27.5 22L22.5 22Z" fill="#7EE684"/> \
  	 	</g> \
		</svg>';

    const containerHtmlElement = document.getElementById(containerId) as HTMLElement;
    if (containerHtmlElement === null || containerHtmlElement === undefined) {
      return;
    }
    const iframe = document.createElement('iframe');
    const iframeId = `xdom$$iframe-${containerId}`;
    iframe.src = url; // Replace with your desired URL
    iframe.id = iframeId;
    // Set style properties directly
    iframe.style.width = '100vw';
    iframe.style.height = '60vh';
    iframe.style.border = 'none';
    iframe.style.position = 'absolute';
    iframe.style.top = '100px';
    iframe.style.left = '0';
    document.body.appendChild(iframe);

    const divDownArrow = document.createElement('div');
    divDownArrow.id = 'xdom$$divDownArrow';
    divDownArrow.style.width = '50px';
    divDownArrow.style.height = '150px';
    divDownArrow.style.border = 'none';
    divDownArrow.style.position = 'absolute';
    divDownArrow.style.top = '80%';
    divDownArrow.style.left = '45%';
    divDownArrow.style.zIndex = '100';
    divDownArrow.style.display = 'none';
    divDownArrow.innerHTML = svgArrowDownAnim;

    const divUpArrow = document.createElement('div');
    divUpArrow.id = 'xdom$$divUpArrow';
    divUpArrow.style.width = '50px';
    divUpArrow.style.height = '150px';
    divUpArrow.style.border = 'none';
    divUpArrow.style.position = 'absolute';
    divUpArrow.style.top = '10%';
    divUpArrow.style.left = '45%';
    divUpArrow.style.zIndex = '100';
    divUpArrow.style.display = 'none';
    divUpArrow.innerHTML = svgArrowUpAnim;

    containerHtmlElement.appendChild(iframe);
    containerHtmlElement.appendChild(divDownArrow);
    containerHtmlElement.appendChild(divUpArrow);

    setTimeout(() => {
      divDownArrow.style.display = 'block';
    }, 2000);

    const bigGap = window.outerHeight - window.innerHeight;
    let lastWindowHeight = window.innerHeight;
    window.addEventListener('resize', () => {
      const currentGap = window.outerHeight - window.innerHeight;
      const iframe = document.getElementById(iframeId) as HTMLElement;
      const currentWindowHeight = window.innerHeight;
      if (currentWindowHeight > lastWindowHeight && currentGap >= bigGap) {
        //console.log("iOS Browser bottom bar might be hidden now");
        iframe.style.height = '100vh';
        divDownArrow.style.display = 'none'; // https://www.w3schools.com/cssref/pr_class_display.asp
        divUpArrow.style.display = 'block';
      } else if (currentWindowHeight > lastWindowHeight && currentGap < bigGap) {
        //console.log("iOS Browser bottom bar might be hidden now");
        divDownArrow.style.display = 'none';
        divUpArrow.style.display = 'none';
      } else if (currentWindowHeight < lastWindowHeight && currentGap >= bigGap) {
        //console.log("iOS Browser bottom bar might be visible now");
        iframe.style.height = '60vh';
        divDownArrow.style.display = 'block';
        divUpArrow.style.display = 'none';
      } else if (currentWindowHeight < lastWindowHeight && currentGap < bigGap) {
        //console.log("iOS Browser bottom bar might be visible now");
        divDownArrow.style.display = 'none';
        divUpArrow.style.display = 'none';
      }
      lastWindowHeight = currentWindowHeight;
    });
    window.addEventListener('beforeunload', () => {
      if (iframe && containerHtmlElement.contains(iframe)) {
        containerHtmlElement.removeChild(iframe);
      }
    });
  }

  public static metaExists(name: string, content: string) {
    const metaTags = document.getElementsByTagName('meta');
    for (let i = 0; i < metaTags.length; i++) {
      if (metaTags[i].name === name && metaTags[i].content === content) {
        return true;
      }
    }
    return false;
  }

  public static appendMeta(name: string, content: string) {
    if (!XDom.metaExists(name, content)) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }

  public static setMetaTags() {
    XDom.appendMeta(
      'viewport',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    );
    XDom.appendMeta('apple-mobile-web-app-capable', 'yes');
    XDom.appendMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    XDom.appendMeta('mobile-web-app-capable', 'yes');
  }

  public static setStyle(styleId: string, styleScript: string) {
    let style = document.querySelector(`style[data-id="${styleId}"]`);
    if (!style) {
      // If the style tag doesn't exist, create one
      style = document.createElement('style');
      style.setAttribute('data-id', styleId);
      style.textContent = styleScript;
      document.head.appendChild(style);
    } else {
      // Update the content of the style tag
      style.textContent = styleScript;
    }
  }

  public static removeStyle(styleId: string) {
    const style = document.querySelector(`style[data-id="${styleId}"]`);
    if (style) {
      style.parentNode.removeChild(style);
    }
  }

  public static setStyleBodyFullByClassName(
    targetClass: string,
    targetIndex: number,
    padding: number
  ) {
    const __FUNCTION__ = 'setStyleBodyFullByClassName()';
    const __CLASSNAME__ = XDom.__CLASSNAME__;
    $: {
      const containerElement = XDom.getBodyElement();
      const targetElement = document.getElementsByClassName(targetClass)[targetIndex];
      const errMsg = XDom.setStyleXYFullByElement(containerElement, targetElement, padding);
      _xdomDebug &&
        errMsg !== 'success' &&
        console.error(
          `${__CLASSNAME__}::${__FUNCTION__} error on ${errMsg}, check parameters - targetClass: ${targetClass}, targetIndex: ${targetIndex}`
        );
    }
  }

  public static setStyleBodyFullById(targetId: string, padding: number) {
    const __FUNCTION__ = 'setStyleBodyFullById()';
    const __CLASSNAME__ = XDom.__CLASSNAME__;
    $: {
      const containerElement = XDom.getBodyElement();
      const targetElement = document.getElementById(targetId);
      const errMsg = XDom.setStyleXYFullByElement(containerElement, targetElement, padding);
      _xdomDebug &&
        errMsg !== 'success' &&
        console.error(
          `${__CLASSNAME__}::${__FUNCTION__} error on ${errMsg}, check parameters - targetId: ${targetId}`
        );
    }
  }

  public static setStylePageFullByClassName(
    targetClass: string,
    targetIndex: number,
    padding: number
  ) {
    const __FUNCTION__ = 'setStylePageFullByClassName()';
    const __CLASSNAME__ = XDom.__CLASSNAME__;
    $: {
      const containerElement = XDom.getPageElement();
      const targetElement = document.getElementsByClassName(targetClass)[targetIndex];
      const errMsg = XDom.setStyleXYFullByElement(containerElement, targetElement, padding);
      _xdomDebug &&
        errMsg !== 'success' &&
        console.error(
          `${__CLASSNAME__}::${__FUNCTION__} error on ${errMsg}, check parameters - targetClass: ${targetClass}, targetIndex: ${targetIndex}`
        );
    }
  }

  public static setStylePageFullById(targetId: string, padding: number) {
    const __FUNCTION__ = 'setStylePageFullById()';
    const __CLASSNAME__ = XDom.__CLASSNAME__;
    $: {
      const containerElement = XDom.getPageElement();
      const targetElement = document.getElementById(targetId);
      const errMsg = XDom.setStyleXYFullByElement(containerElement, targetElement, padding);
      _xdomDebug &&
        errMsg !== 'success' &&
        console.error(
          `${__CLASSNAME__}::${__FUNCTION__} error on ${errMsg}, check parameters - targetId: ${targetId}`
        );
    }
  }

  public static setStyleXYFullByClassName(
    containerClass: string,
    containerIndex: number,
    targetClass: string,
    targetIndex: number,
    padding: number
  ) {
    const __FUNCTION__ = 'setStyleXYFullByClassName()';
    const __CLASSNAME__ = XDom.__CLASSNAME__;
    $: {
      const containerElement = document.getElementsByClassName(containerClass)[containerIndex];
      const targetElement = document.getElementsByClassName(targetClass)[targetIndex];
      const errMsg = XDom.setStyleXYFullByElement(containerElement, targetElement, padding);
      _xdomDebug &&
        errMsg !== 'success' &&
        console.error(
          `${__CLASSNAME__}::${__FUNCTION__} error on ${errMsg}, check parameters - targetClass: ${targetClass}, targetIndex: ${targetIndex}`
        );
    }
  }

  public static setStyleXYFullById(containerId: string, targetId: string, padding: number) {
    const __FUNCTION__ = 'setStyleXYFullById()';
    const __CLASSNAME__ = XDom.__CLASSNAME__;
    $: {
      const containerElement = document.getElementById(containerId);
      const targetElement = document.getElementById(targetId);
      const errMsg = XDom.setStyleXYFullByElement(containerElement, targetElement, padding);
      _xdomDebug &&
        errMsg !== 'success' &&
        console.error(
          `${__CLASSNAME__}::${__FUNCTION__} error on ${errMsg}, check parameters - targetId: ${targetId}`
        );
    }
  }

  public static setStyleXYFullByElement(
    _containerElement: any,
    _targetElement: any,
    padding: number
  ) {
    const __FUNCTION__ = 'setStyleXYFullByElement()';
    const __CLASSNAME__ = XDom.__CLASSNAME__;
    if (_containerElement === null || _containerElement === undefined) {
      return `${__FUNCTION__} _containerElement is null or undefined`;
    }
    if (_targetElement === null || _targetElement === undefined) {
      return `${__FUNCTION__} _targetElement is null or undefined`;
    }
    const containerElement = _containerElement;
    const targetElement = _targetElement;
    const containerElementX = containerElement.clientLeft;
    const containerElementY = containerElement.clientTop;
    const containerElementW = containerElement.clientWidth;
    const containerElementH = containerElement.clientHeight;
    const containerElementOffsetX = containerElement.offsetLeft;
    const containerElementOffsetY = containerElement.offsetTop;
    const containerElementOffsetW = containerElement.offsetWidth;
    const containerElementOffsetH = containerElement.offsetHeight;
    targetElement.style.position = 'absolute';
    targetElement.style.left = `${containerElementOffsetX - padding}px`;
    targetElement.style.top = `${containerElementOffsetY - padding}px`;
    targetElement.style.width = `${containerElementOffsetW + padding * 2}px`;
    targetElement.style.height = `${containerElementOffsetH + padding * 2}px`;
    return 'success';
  }

  public static setStyleElementVisibleByClassName(
    targetClass: string,
    targetIndex: number,
    visible: boolean
  ) {
    const targetElement = document.getElementsByClassName(targetClass)[targetIndex];
    if (targetElement !== null && targetElement !== undefined) {
      targetElement.style.visibility = visible ? 'visible' : 'hidden';
      return true;
    }
    return false;
  }

  public static setStyleElementVisibleById(targetId: string, visible: boolean) {
    const __FUNCTION__ = 'setStyleElementVisibleById()';
    const __CLASSNAME__ = XDom.__CLASSNAME__;
    const targetElement = document.getElementById(targetId);
    if (targetElement !== null && targetElement !== undefined) {
      targetElement.style.visibility = visible ? 'visible' : 'hidden';
      return true;
    }
    return false;
  }

  public static setStyleElementEnableByClassName(
    uniqueDivId: string,
    targetClass: string,
    targetIndex: number,
    enable: boolean,
    disableStyle?: {
      backgroundColor?: 'black';
      opacity?: '0.4';
      filter?: 'alpha(opacity = 50)';
    }
  ) {
    const __FUNCTION__ = 'setStyleElementEnable()';
    const __CLASSNAME__ = XDom.__CLASSNAME__;
    const divIdSuffix = '_domElmnt_';
    const divId = uniqueDivId + targetClass + targetIndex + divIdSuffix;
    const targetElement = document.getElementsByClassName(targetClass)[targetIndex];
    if (targetElement === null || targetElement === undefined) {
      _xdomDebug &&
        console.error(
          `${__CLASSNAME__}::${__FUNCTION__} error on finding DOM element, check parameters - targetClass: ${targetClass}, targetIndex: ${targetIndex}`
        );
      return false;
    }
    if (enable) {
      targetElement.style.disabled = false;
      targetElement.style.pointerEvents = 'auto';
      targetElement.style.opacity = '1';
      const childElement = document.getElementById(divId);
      childElement && targetElement.removeChild(childElement);
    } else {
      let newDiv = document.createElement('div');
      newDiv.id = divId;
      newDiv.style.position = 'absolute';
      newDiv.style.top = '0';
      newDiv.style.left = '0';
      newDiv.style.width = targetElement.scrollWidth + 'px';
      newDiv.style.height = targetElement.scrollHeight + 'px';
      newDiv.style.overflow = 'auto';
      newDiv.style.zIndex = '999';
      newDiv.style.backgroundColor = disableStyle?.backgroundColor
        ? disableStyle?.backgroundColor
        : 'black';
      newDiv.style.opacity = disableStyle?.opacity ? disableStyle?.opacity : '0.4';
      newDiv.style.filter = disableStyle?.filter ? disableStyle?.filter : 'alpha(opacity = 50)';
      targetElement.append(newDiv);
      targetElement.style.disabled = true;
      targetElement.style.pointerEvents = 'none';
      targetElement.style.opacity = '1';
    }
    return true;
  }

  public static setStyleElementEnableById(
    uniqueDivId: string,
    targetId: string,
    enable: boolean,
    disableStyle?: {
      backgroundColor?: 'black';
      opacity?: '0.4';
      filter?: 'alpha(opacity = 50)';
    }
  ) {
    const __FUNCTION__ = 'setStyleElementEnableById()';
    const __CLASSNAME__ = XDom.__CLASSNAME__;
    const divIdSuffix = '_domElmnt_';
    const divId = targetId + divIdSuffix;
    const targetElement = document.getElementsByClassName(targetId);
    if (targetElement === null || targetElement === undefined) {
      _xdomDebug &&
        console.error(
          `${__CLASSNAME__}::${__FUNCTION__} error on finding DOM element, check parameters - targetId: ${targetId}`
        );
      return false;
    }
    if (enable) {
      targetElement.style.disabled = false;
      targetElement.style.pointerEvents = 'auto';
      targetElement.style.opacity = '1';
      targetElement.removeChild(document.getElementById(divId));
    } else {
      let newDiv = document.createElement('div');
      newDiv.id = divId;
      newDiv.style.position = 'absolute';
      newDiv.style.top = '0';
      newDiv.style.left = '0';
      newDiv.style.width = targetElement.scrollWidth + 'px';
      newDiv.style.height = targetElement.scrollHeight + 'px';
      newDiv.style.overflow = 'auto';
      newDiv.style.zIndex = '999';
      newDiv.style.backgroundColor = disableStyle?.backgroundColor
        ? disableStyle?.backgroundColor
        : 'black';
      newDiv.style.opacity = disableStyle?.opacity ? disableStyle?.opacity : '0.4';
      newDiv.style.filter = disableStyle?.filter ? disableStyle?.filter : 'alpha(opacity = 50)';
      targetElement.append(newDiv);
      targetElement.style.disabled = true;
      targetElement.style.pointerEvents = 'none';
      targetElement.style.opacity = '1';
    }
    return true;
  }

  public static getBodyElement() {
    return document.getElementsByTagName('body')[0].getElementsByTagName('div')[0];
  }

  public static getPageElement() {
    return document.getElementById('page');
  }

  public static startSnowFall() {
    // 1. Create the 'xdom$$snowCanvas' canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'xdom$$snowCanvas';

    // 2. Append canvas to the body (or another container of your choice)
    document.body.appendChild(canvas);

    // 3. Set styles for the canvas
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999';

    // 4. Add event listener to the DOMContentLoaded event
    const ctx = canvas.getContext('2d');

    // Adjust canvas size when window is resized
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();

    const numberOfSnowflakes = 100;
    const snowflakes = [];
    const colors = [
      'rgba(255, 255, 255, 1.0)', // White with alpha
      'rgba(140, 192, 220, 1.0)', // Light blue with alpha
      'rgba(183, 228, 239, 1.0)', // Light blue with alpha
    ]; // Colors with alpha

    // Create snowflakes
    for (let i = 0; i < numberOfSnowflakes; i++) {
      snowflakes.push({
        x: Math.floor(Math.random() * canvas.width * 2 + 1) - canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 4 + 1,
        density: Math.random() * 1,
        color: colors[i % colors.length],
        shape: i % 8 ? 'circle' : 'star',
      });
    }

    // Draw the snowflakes
    function drawSnowflakes() {
      ctx.globalAlpha = 1.0; // 100% transparency for all snowflakes
      /*
      ctx.filter = 'blur(0.5px)'; // Apply blur effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Shadow color
      ctx.shadowBlur = 5; // Blur level
      ctx.shadowOffsetX = 2; // Horizontal shadow offset
      ctx.shadowOffsetY = 2; // Vertical shadow offset
      */
      for (let i = 0; i < numberOfSnowflakes; i++) {
        let snowflake = snowflakes[i];
        ctx.beginPath();
        ctx.fillStyle = snowflake.color;
        if (snowflake.shape === 'circle') {
          drawCircle(ctx, snowflake.x, snowflake.y, snowflake.radius);
        } else {
          drawStar(ctx, snowflake.x, snowflake.y, 5, snowflake.radius * 2, snowflake.radius);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1.0; // Reset alpha to fully opaque for other drawings
      // Reset shadow and filter effects
      /*
      ctx.filter = 'none';
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      */
      moveSnowflakes();
    }

    // Animate the snowflakes
    function moveSnowflakes() {
      for (let i = 0; i < numberOfSnowflakes; i++) {
        let snowflake = snowflakes[i];
        snowflake.y += Math.pow(snowflake.density, 2) + 1;
        snowflake.x += snowflake.x % 5 === 0 ? 1 : 0.5;
        if (snowflake.y > canvas.height) {
          snowflakes[i] = {
            x: Math.floor(Math.random() * canvas.width * 2 + 1) - canvas.width,
            y: 0,
            radius: snowflake.radius,
            density: snowflake.density,
            color: colors[i % colors.length],
            shape: i % 8 ? 'circle' : 'star',
          };
        }
      }
    }

    function drawCircle(ctx, cx, cy, radius) {
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
    }

    function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
      var rot = (Math.PI / 2) * 3;
      var x = cx;
      var y = cy;
      var step = Math.PI / spikes;

      ctx.moveTo(cx, cy - outerRadius);

      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }

      ctx.lineTo(cx, cy - outerRadius);
    }

    // 1) We can call the function periodically to animate the snowflakes using setInterval()
    //setInterval(drawSnowflakes, 15); // 60 frames per second

    // 2) Or call the function recursively using requestAnimationFrame()
    function updateSnowfall() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawSnowflakes();
      moveSnowflakes();
      requestAnimationFrame(updateSnowfall);
    }
    updateSnowfall();
  }
}

export default XDom;
