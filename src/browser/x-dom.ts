/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

const _xdomDebug = false;

class XDom {
  public static __CLASSNAME__ = 'XDom';

  public static setDebug(debug: boolean) {
    _xdomDebug = debug;
  }

  public static InitXDomElements() {
    if (typeof document === 'undefined') return;
    if (typeof window === 'undefined') return;

    // Style the page
    const style = document.createElement('style');
    let styleText = ':-webkit-full-screen { background-color: #303030; } \n'; // Chrome, Safari and Opera syntax
    styleText += ':-moz-full-screen { background-color: #303030; } \n'; // Firefox syntax
    styleText += ':-ms-fullscreen { background-color: #303030; } \n'; // IE11 or Edge syntax
    styleText += ':fullscreen { background-color: #303030; } \n'; // Standard syntax
    styleText += 'button { padding: 20px; font-size: 20px; } \n'; // Style the button
    style.textContent = styleText;
    document.head.appendChild(style);

    // Create xdom object
    window.xdom = window.xdom || {};

    // Fullscreen functions
    const elem = document.documentElement;
    window.xdom.openFullscreen = () => {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(); // Safari
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen(); // IE11 or Edge
      }
    };

    window.xdom.closeFullscreen = () => {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen(); // Safari
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen(); // IE11 or Edge
      }
    };

    // Add event listeners
    document
      .getElementById('xdom$$OpenFullscreen')
      ?.addEventListener('click', window.xdom.openFullscreen);
    document
      .getElementById('xdom$$closeFullscreen')
      ?.addEventListener('click', window.xdom.closeFullscreen);

    // You can call the function on DOMContentLoaded or wherever it suits your needs
    document.addEventListener('DOMContentLoaded', function () {
      XDom.setMetaTags();
    });
  }

  public static enableFullscreen() {
    // Set the viewport properties
    var meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(meta);

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

  public static setMetaTags() {
    var viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(viewport);

    var appleWebAppCapable = document.createElement('meta');
    appleWebAppCapable.name = 'apple-mobile-web-app-capable';
    appleWebAppCapable.content = 'yes';
    document.getElementsByTagName('head')[0].appendChild(appleWebAppCapable);

    var appleStatusBarStyle = document.createElement('meta');
    appleStatusBarStyle.name = 'apple-mobile-web-app-status-bar-style';
    appleStatusBarStyle.content = 'black-translucent';
    document.getElementsByTagName('head')[0].appendChild(appleStatusBarStyle);
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
