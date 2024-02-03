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
    toggleClass as _toggleClass
} from '@carry0987/utils';

import { StylesObject, OnChangeCallback, OnCompleteCallback } from '../interface/interfaces';

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

    static isDigit(key: string): boolean {
        return /^\d$/.test(key);
    }

    static updateVisiblePinCode(element: HTMLInputElement, onInput?: OnChangeCallback, onComplete?: OnCompleteCallback): void {
        const value = element.value;
        const grids = Utils.getElem('.pincode-grid span', 'all') as NodeList;

        grids.forEach((span, index) => {
            span.textContent = value[index] || '';
        });

        // Call onchange event if defined
        onInput?.(element.value, element.value.length - 1);

        // Call oncomplete event if defined and the pin code is complete
        if (element.value.length === element.maxLength) {
            onComplete?.(element.value);
        }
    }

    static buildStyles(
        baseSelector: string,
        checkedSelector: string,
        baseStyle: StylesObject,
        checkedStyle?: StylesObject
    ): Record<string, StylesObject> {
        let styles: Record<string, StylesObject> = {};
        const arrayBuilder = (
            selector: string,
            styleValues: StylesObject,
            checked = false
        ): void => {
            let space = selector.startsWith('::') ? '' : ' ';
            if (!selector) space = '.' + checkedSelector;
            styles[`span.pincodeInput${checked ? '.' + checkedSelector : ''}${space}${selector}`] = styleValues;
        };

        if (typeof baseStyle === 'object' && typeof checkedStyle === 'object') {
            arrayBuilder(baseSelector, baseStyle);
            arrayBuilder(baseSelector, checkedStyle, true);
        } else {
            for (let [selector, value] of Object.entries(baseStyle)) {
                arrayBuilder(selector, value as StylesObject, !!selector);
            }
        }

        return styles;
    }
}

Utils.setStylesheetId('pincodeInput-style');
Utils.setReplaceRule('.pincodeInput', '.pincodeInput');

export default Utils;
