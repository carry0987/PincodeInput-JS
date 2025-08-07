const defaults = {
    autoFocus: false,
    allowEscape: true,
    allowPaste: true,
    secure: false,
    placeHolder: '•',
    forceDigits: true,
    enableNavigation: true,
    length: 6,
    styles: {},
    onLoad: () => { },
    onInput: (value, idx) => { },
    onComplete: (value) => { }
};

function reportError(...error) {
    console.error(...error);
}
function throwError(message) {
    throw new Error(message);
}

var errorUtils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    reportError: reportError,
    throwError: throwError
});

function getElem(ele, mode, parent) {
    // Return generic Element type or NodeList
    if (typeof ele !== 'string') {
        return ele;
    }
    let searchContext = document;
    if (mode === null && parent) {
        searchContext = parent;
    }
    else if (mode && mode instanceof Node && 'querySelector' in mode) {
        searchContext = mode;
    }
    else if (parent && parent instanceof Node && 'querySelector' in parent) {
        searchContext = parent;
    }
    // If mode is 'all', search for all elements that match, otherwise, search for the first match
    // Casting the result as E or NodeList
    return mode === 'all' ? searchContext.querySelectorAll(ele) : searchContext.querySelector(ele);
}
function createElem(tagName, attrs = {}, text = '') {
    let elem = document.createElement(tagName);
    for (let attr in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, attr)) {
            if (attr === 'textContent' || attr === 'innerText') {
                elem.textContent = attrs[attr];
            }
            else {
                elem.setAttribute(attr, attrs[attr]);
            }
        }
    }
    if (text)
        elem.textContent = text;
    return elem;
}
function addClass(ele, className) {
    ele.classList.add(className);
    return ele;
}
function removeClass(ele, className) {
    ele.classList.remove(className);
    return ele;
}
function toggleClass(ele, className, force) {
    ele.classList.toggle(className, force);
    return ele;
}

let stylesheetId = 'utils-style';
const replaceRule = {
    from: '.utils',
    to: '.utils-'
};
function isObject(item) {
    return typeof item === 'object' && item !== null && !isArray(item);
}
function isNumber(item) {
    return typeof item === 'number';
}
function isArray(item) {
    return Array.isArray(item);
}
function isEmpty(value) {
    // Check for number
    if (typeof value === 'number') {
        return false;
    }
    // Check for string
    if (typeof value === 'string' && value.length === 0) {
        return true;
    }
    // Check for array
    if (isArray(value) && value.length === 0) {
        return true;
    }
    // Check for object
    if (isObject(value) && Object.keys(value).length === 0) {
        return true;
    }
    // Check for any falsy values
    return !value;
}
function deepMerge(target, ...sources) {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if (source) {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                const sourceKey = key;
                const value = source[sourceKey];
                const targetKey = key;
                if (isObject(value) || isArray(value)) {
                    if (!target[targetKey] || typeof target[targetKey] !== 'object') {
                        target[targetKey] = isArray(value) ? [] : {};
                    }
                    deepMerge(target[targetKey], value);
                }
                else {
                    target[targetKey] = value;
                }
            }
        }
    }
    return deepMerge(target, ...sources);
}
function setStylesheetId(id) {
    stylesheetId = id;
}
function setReplaceRule(from, to) {
    replaceRule.from = from;
    replaceRule.to = to;
}
// CSS Injection
function injectStylesheet(stylesObject, id = null) {
    id = isEmpty(id) ? '' : id;
    // Create a style element
    let style = createElem('style');
    // WebKit hack
    style.id = stylesheetId + id;
    style.textContent = '';
    // Add the style element to the document head
    document.head.append(style);
    let stylesheet = style.sheet;
    for (let selector in stylesObject) {
        if (stylesObject.hasOwnProperty(selector)) {
            compatInsertRule(stylesheet, selector, buildRules(stylesObject[selector]), id);
        }
    }
}
function buildRules(ruleObject) {
    let ruleSet = '';
    for (let [property, value] of Object.entries(ruleObject)) {
        property = property.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
        ruleSet += `${property}:${value};`;
    }
    return ruleSet;
}
function compatInsertRule(stylesheet, selector, cssText, id = null) {
    id = isEmpty(id) ? '' : id;
    let modifiedSelector = selector.replace(replaceRule.from, replaceRule.to + id);
    stylesheet.insertRule(modifiedSelector + '{' + cssText + '}', 0);
}
function removeStylesheet(id = null) {
    const styleId = isEmpty(id) ? '' : id;
    let styleElement = getElem('#' + stylesheetId + styleId);
    if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
    }
}

function addEventListener(element, eventName, handler, options) {
    element.addEventListener(eventName, handler, options);
}

class Utils {
    static pinHideTimeoutMap = new WeakMap();
    static throwError = errorUtils.throwError;
    static deepMerge = deepMerge;
    static setStylesheetId = setStylesheetId;
    static setReplaceRule = setReplaceRule;
    static injectStylesheet = injectStylesheet;
    static removeStylesheet = removeStylesheet;
    static getElem = getElem;
    static createElem = createElem;
    static addClass = addClass;
    static removeClass = removeClass;
    static toggleClass = toggleClass;
    static addEventListener = addEventListener;
    static isDigit(key) {
        return /^\d$/.test(key);
    }
    static updateVisiblePinCode(element, onInput, onComplete, secret, // placeholder char
    activeIndex) {
        const value = element.value;
        const grids = Utils.getElem('.pincode-grid span', 'all');
        // If not secure, update immediately
        if (!secret) {
            grids.forEach((span, idx) => {
                if (isNumber(activeIndex)) {
                    if (idx === activeIndex && !value[idx]) {
                        span.textContent = ''; // Forced clear
                    }
                    else {
                        span.textContent = value[idx] || '';
                    }
                }
                else {
                    span.textContent = value[idx] || '';
                }
            });
            onInput?.(value, activeIndex ?? value.length - 1);
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
            }
            else {
                span.textContent = value[index] ? secret : '';
            }
        });
        // Call onInput event if defined
        onInput?.(value, element.selectionStart ?? value.length - 1);
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
    static clearTimeout(element) {
        if (Utils.pinHideTimeoutMap.has(element)) {
            clearTimeout(Utils.pinHideTimeoutMap.get(element));
            Utils.pinHideTimeoutMap.delete(element);
        }
    }
}
Utils.setStylesheetId('pincodeInput-style');
Utils.setReplaceRule('.pincodeInput', '.pincodeInput');

const reportInfo = (vars, showType = false) => {
    if (showType === true) {
        console.log('Data Type : ' + typeof vars, '\nValue : ' + vars);
    }
    else if (typeof showType !== 'boolean') {
        console.log(showType);
    }
    else {
        console.log(vars);
    }
};

class PincodeInput {
    static instances = [];
    static version = '1.2.0';
    element;
    options = defaults;
    activeGridIndex = 0;
    // Methods for external use
    onInputCallback = undefined;
    onCompleteCallback = undefined;
    constructor(element, option = {}) {
        this.init(element, option);
        PincodeInput.instances.push(this);
        if (PincodeInput.instances.length === 1) {
            reportInfo(`PincodeInput is loaded, version: ${PincodeInput.version}`);
        }
    }
    /**
     * Initialization
     */
    init(element, option) {
        let elem;
        if (typeof element === 'string') {
            elem = Utils.getElem(element);
        }
        else {
            elem = element;
        }
        if (!elem)
            Utils.throwError('Element not found');
        if (!(elem instanceof HTMLInputElement))
            Utils.throwError('Element must be an input field');
        this.element = elem;
        // Replace default options with user defined options
        this.options = Utils.deepMerge({}, defaults, option);
        // Set event handlers' callback if provided
        this.onInputCallback = option.onInput;
        this.onCompleteCallback = option.onComplete;
        // Call the onLoad callback if provided
        this.options?.onLoad?.();
        // Create pincode grids
        this.createPincodeGrids(PincodeInput.instances.length);
    }
    createPincodeGrids(id) {
        const options = this.options;
        const maxLength = this.element.maxLength > 0 ? this.element.maxLength : options.length;
        // Define the finalStyles object that will be aggregated and used later
        let finalStyles = {};
        if (options.styles && Object.keys(options.styles).length > 0) {
            finalStyles = Utils.deepMerge({}, options.styles, finalStyles);
        }
        // Now that we've built up our styles, inject them
        finalStyles && Utils.injectStylesheet(finalStyles, id.toString());
        // Create a container for pin code block
        const pincodeWrapper = Utils.createElem('div');
        pincodeWrapper.className = 'pincodeInput';
        // Create a container for pin code grids
        const pinCode = Utils.createElem('div');
        pinCode.className = 'pincode';
        // Create visible pin code grids and append them to the wrapper
        for (let i = 0; i < maxLength; i++) {
            const grid = Utils.createElem('div');
            const span = Utils.createElem('span');
            grid.className = 'pincode-grid';
            grid.dataset.index = i.toString();
            grid.appendChild(span);
            pinCode.appendChild(grid);
        }
        // Insert the pincodeWrapper into the DOM at the position of the original input element
        const parentElement = this.element.parentElement;
        const nextSibling = this.element.nextSibling;
        if (parentElement) {
            parentElement.removeChild(this.element); // Remove the original input from the DOM
            if (nextSibling) {
                parentElement.insertBefore(pincodeWrapper, nextSibling);
            }
            else {
                parentElement.appendChild(pincodeWrapper);
            }
        }
        // Add class to the hidden input
        Utils.addClass(this.element, 'pincode-input');
        this.element.removeAttribute('hidden');
        // Setup the hidden input
        this.element.type = options.secure ? 'password' : 'text';
        this.element.pattern = '[0-9]*';
        this.element.inputMode = 'numeric';
        this.element.maxLength = maxLength;
        this.element.autocomplete = 'off';
        // Append the original input to the wrapper
        pincodeWrapper.appendChild(this.element);
        // Insert pin code grids into pincode wrapper
        pincodeWrapper.appendChild(pinCode);
        // Bind click events to the grids to focus the hidden input
        Utils.getElem('.pincode-grid', 'all', pincodeWrapper).forEach((grid) => {
            Utils.addEventListener(grid, 'click', () => this.element.focus());
        });
        // Add input and keyboard event listeners for the hidden input
        Utils.addEventListener(this.element, 'input', this.onPinInput.bind(this));
        Utils.addEventListener(this.element, 'keydown', this.handleKeydown.bind(this));
        // Handle paste event
        Utils.addEventListener(this.element, 'paste', this.handlePaste.bind(this));
        // Bind grid click event to focus input and update focus
        Utils.addEventListener(this.element, 'focus', () => this.updateFocus());
        // Bind blur event to the hidden input to remove the focus class
        Utils.addEventListener(this.element, 'blur', this.removeFocus.bind(this), true);
        // If autofocus is true, focus the hidden input
        if (options.autoFocus) {
            this.setActiveGrid(0);
        }
        return this;
    }
    // Set the active grid index and focus the input
    setActiveGrid(index) {
        this.activeGridIndex = index;
        this.element.focus();
        // Move the cursor to the specified index
        this.element.setSelectionRange(index, index);
        this.updateFocus();
    }
    // Update the current focus grid based on the length of the input value
    updateFocus() {
        const grids = Array.from(Utils.getElem('.pincode-grid', 'all'));
        const valueLength = this.element.value.length;
        // If enableNavigation is false, set activeGridIndex to valueLength
        if (!this.options.enableNavigation || this.options.secure) {
            this.activeGridIndex = valueLength;
        }
        grids.forEach((grid, idx) => {
            if (idx === this.activeGridIndex) {
                Utils.addClass(grid, 'pincode-focus');
            }
            else {
                Utils.removeClass(grid, 'pincode-focus');
            }
        });
        this.element.focus();
    }
    // Remove focus from all grids
    removeFocus() {
        const grids = Utils.getElem('.pincode-grid', 'all');
        grids.forEach((grid) => {
            Utils.removeClass(grid, 'pincode-focus');
        });
    }
    // Handle input event on the hidden input
    onPinInput(event) {
        const input = event.target;
        if (this.options.forceDigits && input.value) {
            // Remove any non-digit characters from the value
            input.value = input.value.replace(/\D/g, '');
        }
        // If navigation is enabled, update activeGridIndex to current caret position
        if (this.options.enableNavigation && !this.options.secure) {
            // If selectionStart has a value, synchronize activeGridIndex
            this.activeGridIndex = input.selectionStart ?? input.value.length;
        }
        else {
            // Default behavior: put focus on last character
            this.activeGridIndex = input.value.length;
        }
        const placeHolder = this.options.secure ? this.options.placeHolder : undefined;
        if (input.value.length <= input.maxLength) {
            Utils.updateVisiblePinCode(input, this.onInputCallback, this.onCompleteCallback, placeHolder, this.activeGridIndex);
            this.updateFocus();
        }
        else {
            // Prevent the value from exceeding maxLength
            input.value = input.value.slice(0, input.maxLength);
        }
    }
    // Handle keydown event
    handleKeydown(event) {
        // Allow paste shortcut (Ctrl+V or Cmd+V) regardless of forceDigits
        const isPasteShortcut = (event.ctrlKey || event.metaKey) && event.key === 'v';
        if (isPasteShortcut)
            return; // Do not prevent the default paste action
        if (this.options.enableNavigation && !this.options.secure) {
            const { maxLength } = this.element;
            switch (event.key) {
                case 'ArrowLeft':
                    if (this.activeGridIndex > 0) {
                        this.setActiveGrid(this.activeGridIndex - 1);
                    }
                    event.preventDefault();
                    return;
                case 'ArrowRight':
                    if (this.activeGridIndex < maxLength - 1) {
                        this.setActiveGrid(this.activeGridIndex + 1);
                    }
                    event.preventDefault();
                    return;
                case 'ArrowUp':
                    this.setActiveGrid(0);
                    event.preventDefault();
                    return;
                case 'ArrowDown':
                    this.setActiveGrid(maxLength - 1);
                    event.preventDefault();
                    return;
                case 'Backspace':
                    // If the cursor is not in the first grid, move to the previous grid and delete that position, otherwise follow the original behavior
                    if (this.activeGridIndex > 0) {
                        const valueArr = this.element.value.split('');
                        valueArr.splice(this.activeGridIndex, 1);
                        this.element.value = valueArr.join('');
                        this.setActiveGrid(this.activeGridIndex - 1);
                        Utils.updateVisiblePinCode(this.element, this.onInputCallback, this.onCompleteCallback, undefined, this.activeGridIndex + 1);
                        this.updateFocus();
                    }
                    else {
                        this.handleBackspace();
                    }
                    event.preventDefault();
                    return;
                case 'Escape':
                    if (this.options.allowEscape) {
                        this.handleEscape();
                    }
                    return;
            }
            return;
        }
        if (event.key === 'Backspace') {
            this.handleBackspace();
            event.preventDefault();
            return;
        }
        if (event.key === 'Escape' && this.options.allowEscape) {
            this.handleEscape();
            return;
        }
        // Limit input to digits if forceDigits is true
        if (this.options.forceDigits && !isPasteShortcut) {
            if (!Utils.isDigit(event.key)) {
                // Prevent any key that's not a digit
                event.preventDefault();
            }
        }
    }
    // Handle Backspace key
    handleBackspace() {
        const value = this.element.value;
        const placeHolder = this.options.secure ? this.options.placeHolder : undefined;
        if (value.length === 0)
            return;
        this.element.value = value.slice(0, value.length - 1);
        Utils.updateVisiblePinCode(this.element, this.onInputCallback, this.onCompleteCallback, placeHolder);
        this.updateFocus();
    }
    // Handle Escape key
    handleEscape() {
        this.clear();
        this.element.blur();
    }
    // Handle paste event
    handlePaste(event) {
        if (!this.options.allowPaste) {
            event.preventDefault();
            return;
        }
        const clipboardData = event.clipboardData;
        if (!clipboardData)
            return;
        const pastedData = clipboardData.getData('text').slice(0, this.element.maxLength);
        if (this.options.forceDigits) {
            // Remove any non-digit characters from the pasted data
            this.element.value = pastedData.replace(/\D/g, '');
        }
        else {
            this.element.value = pastedData;
        }
        Utils.updateVisiblePinCode(this.element, this.onInputCallback, this.onCompleteCallback, this.options.secure ? this.options.placeHolder : undefined);
        // Update the active grid index based on the pasted value
        this.activeGridIndex = this.element.value.length;
        // Update the focus on the grids
        this.updateFocus();
        event.preventDefault(); // Prevent the default paste action
    }
    // Clear the input value
    clear() {
        this.element.value = '';
        this.activeGridIndex = 0;
        this.element.dispatchEvent(new Event('input'));
        Utils.clearTimeout(this.element);
    }
    // Destroy the instance
    destroy() {
        let id = PincodeInput.instances.indexOf(this);
        if (id < 0) {
            Utils.throwError('PincodeInput instance not found');
            return;
        }
        Utils.removeStylesheet(id.toString());
        this.element.remove();
        PincodeInput.instances.splice(id, 1);
    }
    // Methods for external use
    set onInput(callback) {
        this.onInputCallback = callback;
    }
    set onComplete(callback) {
        this.onCompleteCallback = callback;
    }
    // Get the value of the input
    get value() {
        return this.element.value;
    }
}

var interfaces = /*#__PURE__*/Object.freeze({
    __proto__: null
});

export { PincodeInput, interfaces as PincodeInputInterface };
