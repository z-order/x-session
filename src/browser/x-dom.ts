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
}

export default XDom;
