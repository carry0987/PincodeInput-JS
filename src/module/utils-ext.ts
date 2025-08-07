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
    private static pinHideTimeoutMap = new WeakMap<HTMLInputElement, number>();

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

    static updateVisiblePinCode(
        element: HTMLInputElement,
        onInput?: OnChangeCallback,
        onComplete?: OnCompleteCallback,
        secret?: string // placeholder char
    ): void {
        const value = element.value;
        const grids = Utils.getElem('.pincode-grid span', 'all') as NodeListOf<HTMLSpanElement>;

        // If not secure, update immediately
        if (!secret) {
            grids.forEach((span, index) => {
                span.textContent = value[index] || '';
            });
            onInput?.(value, value.length - 1);
            if (value.length === element.maxLength) {
                onComplete?.(value);
            }
            // Clear any previous timeout
            Utils.clearTimeout(element);
            return;
        }

        // Clear the previous timeout to prevent multiple executions
        Utils.clearTimeout(element);

        // Show the last character and hide the others
        grids.forEach((span, index) => {
            if (index === value.length - 1) {
                span.textContent = value[index] || '';
            } else {
                span.textContent = value[index] ? secret : '';
            }
        });

        // Call onInput event if defined
        onInput?.(value, value.length - 1);

        // Set a timeout to hide all characters
        if (value.length > 0) {
            const timeout = window.setTimeout(() => {
                // Check if the value has changed before hiding
                if (element.value === value) {
                    grids.forEach((span, idx) => {
                        span.textContent = value[idx] ? secret : '';
                    });
                }
                Utils.pinHideTimeoutMap.delete(element);
            }, 500);
            Utils.pinHideTimeoutMap.set(element, timeout);
        }

        // Call oncomplete event if defined and the pin code is complete
        if (value.length === element.maxLength) {
            onComplete?.(value);
        }
    }

    static clearTimeout(element: HTMLInputElement): void {
        if (Utils.pinHideTimeoutMap.has(element)) {
            clearTimeout(Utils.pinHideTimeoutMap.get(element));
            Utils.pinHideTimeoutMap.delete(element);
        }
    }
}

Utils.setStylesheetId('pincodeInput-style');
Utils.setReplaceRule('.pincodeInput', '.pincodeInput');

export default Utils;
