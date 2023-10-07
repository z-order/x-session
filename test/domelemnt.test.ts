/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck @ts-ignore
function _setStyleBodyFullByClassName(targetClass: string, targetIndex: number, padding: number) {
  const __FUNCTION__ = '_setStyleBodyFullByClassName()';
  $: {
    const containerElement = _getBodyElement();
    const targetElement = document.getElementsByClassName(targetClass)[targetIndex];
    const errMsg = _setStyleXYFullByElement(containerElement, targetElement, padding);
    errMsg !== 'success' &&
      console.error(
        `${__FUNCTION__} error on ${errMsg}, check parameters - targetClass: ${targetClass}, targetIndex: ${targetIndex}`
      );
  }
}

function _setStyleBodyFullById(targetId: string, padding: number) {
  const __FUNCTION__ = '_setStyleBodyFullById()';
  $: {
    const containerElement = _getBodyElement();
    const targetElement = document.getElementById(targetId);
    const errMsg = _setStyleXYFullByElement(containerElement, targetElement, padding);
    errMsg !== 'success' &&
      console.error(`${__FUNCTION__} error on ${errMsg}, check parameters - targetId: ${targetId}`);
  }
}

function _setStylePageFullByClassName(targetClass: string, targetIndex: number, padding: number) {
  const __FUNCTION__ = '_setStylePageFullByClassName()';
  $: {
    const containerElement = _getPageElement();
    const targetElement = document.getElementsByClassName(targetClass)[targetIndex];
    const errMsg = _setStyleXYFullByElement(containerElement, targetElement, padding);
    errMsg !== 'success' &&
      console.error(
        `${__FUNCTION__} error on ${errMsg}, check parameters - targetClass: ${targetClass}, targetIndex: ${targetIndex}`
      );
  }
}

function _setStylePageFullById(targetId: string, padding: number) {
  const __FUNCTION__ = '_setStylePageFullById()';
  $: {
    const containerElement = _getPageElement();
    const targetElement = document.getElementById(targetId);
    const errMsg = _setStyleXYFullByElement(containerElement, targetElement, padding);
    errMsg !== 'success' &&
      console.error(`${__FUNCTION__} error on ${errMsg}, check parameters - targetId: ${targetId}`);
  }
}

function _setStyleXYFullByClassName(
  containerClass: string,
  containerIndex: number,
  targetClass: string,
  targetIndex: number,
  padding: number
) {
  const __FUNCTION__ = '_setStyleXYFullByClassName()';
  $: {
    const containerElement = document.getElementsByClassName(containerClass)[containerIndex];
    const targetElement = document.getElementsByClassName(targetClass)[targetIndex];
    const errMsg = _setStyleXYFullByElement(containerElement, targetElement, padding);
    errMsg !== 'success' &&
      console.error(
        `${__FUNCTION__} error on ${errMsg}, check parameters - targetClass: ${targetClass}, targetIndex: ${targetIndex}`
      );
  }
}

function _setStyleXYFullById(containerId: string, targetId: string, padding: number) {
  const __FUNCTION__ = '_setStyleXYFullById()';
  $: {
    const containerElement = document.getElementById(containerId);
    const targetElement = document.getElementById(targetId);
    const errMsg = _setStyleXYFullByElement(containerElement, targetElement, padding);
    errMsg !== 'success' &&
      console.error(`${__FUNCTION__} error on ${errMsg}, check parameters - targetId: ${targetId}`);
  }
}

function _setStyleXYFullByElement(_containerElement: any, _targetElement: any, padding: number) {
  const __FUNCTION__ = '_setStyleXYFullByElement()';
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

function _setStyleElementVisibleByClassName(
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

function _setStyleElementVisibleById(targetId: string, visible: boolean) {
  const __FUNCTION__ = '_setStyleElementVisibleById()';
  const targetElement = document.getElementById(targetId);
  if (targetElement !== null && targetElement !== undefined) {
    targetElement.style.visibility = visible ? 'visible' : 'hidden';
    return true;
  }
  return false;
}

function _setStyleElementEnableByClassName(
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
  const __FUNCTION__ = '_setStyleElementEnable()';
  const divIdSuffix = '_domElmnt_';
  const divId = uniqueDivId + targetClass + targetIndex + divIdSuffix;
  const targetElement = document.getElementsByClassName(targetClass)[targetIndex];
  if (targetElement === null || targetElement === undefined) {
    console.error(
      `${__FUNCTION__} error on finding DOM element, check parameters - targetClass: ${targetClass}, targetIndex: ${targetIndex}`
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

function _setStyleElementEnableById(
  uniqueDivId: string,
  targetId: string,
  enable: boolean,
  disableStyle?: {
    backgroundColor?: 'black';
    opacity?: '0.4';
    filter?: 'alpha(opacity = 50)';
  }
) {
  const __FUNCTION__ = '_setStyleElementEnableById()';
  const divIdSuffix = '_domElmnt_';
  const divId = targetId + divIdSuffix;
  const targetElement = document.getElementsByClassName(targetId);
  if (targetElement === null || targetElement === undefined) {
    console.error(
      `${__FUNCTION__} error on finding DOM element, check parameters - targetId: ${targetId}`
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

function _getBodyElement() {
  return document.getElementsByTagName('body')[0].getElementsByTagName('div')[0];
}

function _getPageElement() {
  return document.getElementById('page');
}

export namespace _$domElmnt {
  export const setStyleBodyFullByClassName = _setStyleBodyFullByClassName;
  export const setStyleBodyFullById = _setStyleBodyFullById;
  export const setStylePageFullByClassName = _setStylePageFullByClassName;
  export const setStylePageFullById = _setStylePageFullById;
  export const setStyleXYFullByClassName = _setStyleXYFullByClassName;
  export const setStyleXYFullById = _setStyleXYFullById;
  export const setStyleElementVisibleByClassName = _setStyleElementVisibleByClassName;
  export const setStyleElementVisibleById = _setStyleElementVisibleById;
  export const setStyleElementEnableByClassName = _setStyleElementEnableByClassName;
  export const setStyleElementEnableById = _setStyleElementEnableById;
  export const getBodyElement = _getBodyElement;
  export const getPageElement = _getPageElement;
}
