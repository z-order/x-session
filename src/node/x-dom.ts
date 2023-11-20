/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

let _xdomDebug = false;

class XDom {
  public static __CLASSNAME__ = 'XDom';

  public static errorNodeJs(functionName: string) {
    console.error(
      `${XDom.__CLASSNAME__}: ${functionName} This method can not be called in Node.js (or SvelteKit SSR)! You must use an instance of XDom class in the CSR or in the script of the browser.`
    );
  }

  public static setDebug(debug: boolean) {
    _xdomDebug = debug;
  }

  public static InitXDomElements(_backgroundColor?: string) {
    errorNodeJs('InitXDomElements()');
  }

  public static isLocalhost() {
    errorNodeJs('isLocalhost()');
  }

  public static isMobileDevice() {
    errorNodeJs('isMobileDevice()');
  }

  public static isIOS() {
    errorNodeJs('isIOS()');
  }

  public static isAndroid() {
    errorNodeJs('isAndroid()');
  }

  public static isChrome() {
    errorNodeJs('isChrome()');
  }

  public static isSafari() {
    errorNodeJs('isSafari()');
  }

  public static isFirefox() {
    errorNodeJs('isFirefox()');
  }

  public static isIE() {
    errorNodeJs('isIE()');
  }

  public static isEdge() {
    errorNodeJs('isEdge()');
  }

  public static isOpera() {
    errorNodeJs('isOpera()');
  }

  public static isWindows() {
    errorNodeJs('isWindows()');
  }

  public static isMac() {
    errorNodeJs('isMac()');
  }

  public static isLinux() {
    errorNodeJs('isLinux()');
  }

  public static getBrowser() {
    errorNodeJs('getBrowser()');
  }

  public static getBrowserVersion() {
    errorNodeJs('getBrowserVersion()');
  }

  public static getBrowserLanguage() {
    errorNodeJs('getBrowserLanguage()');
  }

  public static getPlatform() {
    errorNodeJs('getPlatform()');
  }

  public static isFullscreen() {
    errorNodeJs('isFullscreen()');
  }

  public static async openFullscreen() {
    errorNodeJs('openFullscreen()');
  }

  public static closeFullscreen() {
    errorNodeJs('closeFullscreen()');
  }

  public static enableFullscreenButton(showButton: boolean) {
    errorNodeJs('enableFullscreenButton()');
  }

  public static enableFullscreen() {
    errorNodeJs('enableFullscreen()');
  }

  public static fullscreenEnabled() {
    errorNodeJs('fullscreenEnabled()');
  }

  public static metaExists(name: string, content: string) {
    errorNodeJs('metaExists()');
  }

  public static appendMeta(name: string, content: string) {
    errorNodeJs('appendMeta()');
  }

  public static setMetaTags() {
    errorNodeJs('setMetaTags()');
  }

  public static setStyle(styleId: string, styleScript: string) {
    errorNodeJs('setStyle()');
  }

  public static removeStyle(styleId: string) {
    errorNodeJs('removeStyle()');
  }

  public static setStyleBodyFullByClassName(
    targetClass: string,
    targetIndex: number,
    padding: number
  ) {
    errorNodeJs('setStyleBodyFullByClassName()');
  }

  public static setStyleBodyFullById(targetId: string, padding: number) {
    errorNodeJs('setStyleBodyFullById()');
  }

  public static setStylePageFullByClassName(
    targetClass: string,
    targetIndex: number,
    padding: number
  ) {
    errorNodeJs('setStylePageFullByClassName()');
  }

  public static setStylePageFullById(targetId: string, padding: number) {
    errorNodeJs('setStylePageFullById()');
  }

  public static setStyleXYFullByClassName(
    containerClass: string,
    containerIndex: number,
    targetClass: string,
    targetIndex: number,
    padding: number
  ) {
    errorNodeJs('setStyleXYFullByClassName()');
  }

  public static setStyleXYFullById(containerId: string, targetId: string, padding: number) {
    errorNodeJs('setStyleXYFullById()');
  }

  public static setStyleXYFullByElement(
    _containerElement: any,
    _targetElement: any,
    padding: number
  ) {
    errorNodeJs('setStyleXYFullByElement()');
  }

  public static setStyleElementVisibleByClassName(
    targetClass: string,
    targetIndex: number,
    visible: boolean
  ) {
    errorNodeJs('setStyleElementVisibleByClassName()');
  }

  public static setStyleElementVisibleById(targetId: string, visible: boolean) {
    errorNodeJs('setStyleElementVisibleById()');
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
    errorNodeJs('setStyleElementEnableByClassName()');
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
    errorNodeJs('setStyleElementEnableById()');
  }

  public static getBodyElement() {
    errorNodeJs('getBodyElement()');
  }

  public static getPageElement() {
    errorNodeJs('getPageElement()');
  }
}

export default XDom;
