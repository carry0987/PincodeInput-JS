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
    if (typeof ele !== 'string')
        return ele;
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
    return typeof item === 'object' && item !== null && !Array.isArray(item);
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
                if (isObject(value)) {
                    if (!target[targetKey] || typeof target[targetKey] !== 'object') {
                        target[targetKey] = {};
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
function isEmpty(str) {
    if (typeof str === 'number') {
        return false;
    }
    return !str || (typeof str === 'string' && str.length === 0);
}

class Utils {
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
    static isDigit(key) {
        return /^\d$/.test(key);
    }
    static updateVisiblePinCode(element, onInput, onComplete, secret) {
        const value = element.value;
        const grids = Utils.getElem('.pincode-grid span', 'all');
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
    static buildStyles(baseSelector, checkedSelector, baseStyle, checkedStyle) {
        let styles = {};
        const arrayBuilder = (selector, styleValues, checked = false) => {
            let space = selector.startsWith('::') ? '' : ' ';
            if (!selector)
                space = '.' + checkedSelector;
            styles[`span.pincodeInput${checked ? '.' + checkedSelector : ''}${space}${selector}`] = styleValues;
        };
        if (typeof baseStyle === 'object' && typeof checkedStyle === 'object') {
            arrayBuilder(baseSelector, baseStyle);
            arrayBuilder(baseSelector, checkedStyle, true);
        }
        else {
            for (let [selector, value] of Object.entries(baseStyle)) {
                arrayBuilder(selector, value, !!selector);
            }
        }
        return styles;
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

const defaults = {
    secure: false,
    placeHolder: '•',
    forceDigits: true,
    length: 6,
    styles: {},
    onLoad: undefined,
    onInput: undefined,
    onComplete: undefined
};

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".pincode {\n    display: flex;\n    flex-direction: row;\n    align-items: center;\n    justify-content: center;\n}\n.pincode-input {\n    position: absolute;\n    left: -9999px;\n    width: 1px;\n    height: 1px;\n    opacity: 0;\n    pointer-events: none;\n}\n.pincode-grid {\n    box-sizing: border-box;\n    width: 42px;\n    height: 56px;\n    outline: none;\n    border-bottom: 1px solid #b2b2b2;\n    font-size: 45px;\n    font-weight: 700;\n    text-align: center;\n    margin: 0 5px;\n}\n.pincode-focus {\n    border-bottom: 2px solid #007bff;\n}\n";
styleInject(css_248z);

class PincodeInput {
    static instances = [];
    static version = '1.0.3';
    element;
    options;
    // Methods for external use
    _onInput = undefined;
    _onComplete = undefined;
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
        let elem = Utils.getElem(element);
        if (!elem)
            Utils.throwError('Element not found');
        if (!(elem instanceof HTMLInputElement))
            Utils.throwError('Element must be an input field');
        this.element = elem;
        // Replace default options with user defined options
        this.options = Utils.deepMerge({}, defaults, option);
        // Set event handlers' callback if provided
        this._onInput = option.onInput;
        this._onComplete = option.onComplete;
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
        Utils.getElem('.pincode-grid', 'all', pincodeWrapper).forEach(grid => {
            grid.addEventListener('click', () => this.element.focus());
        });
        // Add input and keyboard event listeners for the hidden input
        this.element.addEventListener('input', this.onPinInput.bind(this));
        this.element.addEventListener('keydown', this.handleKeydown.bind(this));
        // Bind grid click event to focus input and update focus
        this.element.addEventListener('focus', () => this.updateFocus());
        // Bind blur event to the hidden input to remove the focus class
        this.element.addEventListener('blur', this.removeFocus.bind(this), true);
        return this;
    }
    // Update the current focus grid based on the length of the input value
    updateFocus() {
        const grids = Array.from(Utils.getElem('.pincode-grid', 'all'));
        const valueLength = this.element.value.length;
        grids.forEach((grid, index) => {
            this.element.focus();
            if (index === valueLength) {
                grid.classList.add('pincode-focus');
            }
            else {
                grid.classList.remove('pincode-focus');
            }
        });
    }
    // Remove focus from all grids
    removeFocus() {
        const grids = document.querySelectorAll('.pincode-grid');
        grids.forEach(grid => {
            grid.classList.remove('pincode-focus');
        });
    }
    // Handle input event on the hidden input
    onPinInput(event) {
        const input = event.target;
        if (this.options.forceDigits && input.value) {
            // Remove any non-digit characters from the value
            input.value = input.value.replace(/\D/g, '');
        }
        const placeHolder = this.options.secure ? this.options.placeHolder : undefined;
        if (input.value.length <= input.maxLength) {
            Utils.updateVisiblePinCode(input, this._onInput, this._onComplete, placeHolder);
            this.updateFocus();
        }
        else {
            // Prevent the value from exceeding maxLength
            input.value = input.value.slice(0, input.maxLength);
        }
    }
    // Handle keydown event
    handleKeydown(event) {
        if (event.key === 'Backspace') {
            this.handleBackspace();
            event.preventDefault();
            return;
        }
        // Limit input to digits if forceDigits is true
        if (this.options.forceDigits) {
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
        if (value.length > 0) {
            this.element.value = value.slice(0, value.length - 1);
            Utils.updateVisiblePinCode(this.element, this._onInput, this._onComplete, placeHolder);
            this.updateFocus();
        }
    }
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
        this._onInput = callback;
    }
    set onComplete(callback) {
        this._onComplete = callback;
    }
}

export { PincodeInput as default };
