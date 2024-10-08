import {
    deepMerge as _deepMerge,
    setStylesheetId as _setStylesheetId,
    setReplaceRule as _setReplaceRule,
    injectStylesheet as _injectStylesheet,
    removeStylesheet as _removeStylesheet,
    errorUtils as _errorUtils,
    getElem as _getElem,
    createElem as _createElem,
    addClass as _addClass,
    removeClass as _removeClass,
    toggleClass as _toggleClass,
    addEventListener as _addEventListener
} from '@carry0987/utils';

import { OnChangeCallback, OnCompleteCallback } from '@/interface/interfaces';

class Utils {
    static throwError = _errorUtils.throwError;
    static deepMerge = _deepMerge;
    static setStylesheetId = _setStylesheetId;
    static setReplaceRule = _setReplaceRule;
    static injectStylesheet = _injectStylesheet;
    static removeStylesheet = _removeStylesheet;
    static getElem = _getElem;
    static createElem = _createElem;
    static addClass = _addClass;
    static removeClass = _removeClass;
    static toggleClass = _toggleClass;
    static addEventListener = _addEventListener;

    static isDigit(key: string): boolean {
        return /^\d$/.test(key);
    }

    static updateVisiblePinCode(element: HTMLInputElement, onInput?: OnChangeCallback, onComplete?: OnCompleteCallback, secret?: string): void {
        const value = element.value;
        const grids = Utils.getElem('.pincode-grid span', 'all') as NodeList;

        grids.forEach((span, index) => {
            span.textContent = secret && value[index] ? secret : value[index] || '';
        });

        // Call onchange event if defined
        onInput?.(element.value, element.value.length - 1);

        // Call oncomplete event if defined and the pin code is complete
        if (element.value.length === element.maxLength) {
            onComplete?.(element.value);
        }
    }
}

Utils.setStylesheetId('pincodeInput-style');
Utils.setReplaceRule('.pincodeInput', '.pincodeInput');

export default Utils;
