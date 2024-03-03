import Utils from './module/utils-ext';
import reportInfo from './module/report';
import { PincodeInputOptions, OnChangeCallback, OnCompleteCallback } from './interface/interfaces';
import { defaults } from './module/config';
import './style/pincodeInput.css';

class PincodeInput {
    private static instances: PincodeInput[] = [];
    private static version: string = '__version__';
    private element!: HTMLInputElement;
    private options: PincodeInputOptions = defaults;

    // Methods for external use
    private onInputCallback: OnChangeCallback | undefined = undefined;
    private onCompleteCallback: OnCompleteCallback | undefined = undefined;

    constructor(element: string | Element, option: Partial<PincodeInputOptions> = {}) {
        this.init(element, option);
        PincodeInput.instances.push(this);

        if (PincodeInput.instances.length === 1) {
            reportInfo(`PincodeInput is loaded, version: ${PincodeInput.version}`);
        }
    }

    /**
     * Initialization
     */
    private init(element: string | Element, option: Partial<PincodeInputOptions>): void {
        let elem: Element | null;
        if (typeof element === 'string') {
            elem = Utils.getElem(element);
        } else {
            elem = element;
        }
        if (!elem) Utils.throwError('Element not found');
        if (!(elem instanceof HTMLInputElement)) Utils.throwError('Element must be an input field');
        this.element = elem as HTMLInputElement;
        // Replace default options with user defined options
        this.options = Utils.deepMerge({} as PincodeInputOptions, defaults, option);
        // Set event handlers' callback if provided
        this.onInputCallback = option.onInput;
        this.onCompleteCallback = option.onComplete;
        // Call the onLoad callback if provided
        this.options?.onLoad?.();
        // Create pincode grids
        this.createPincodeGrids(PincodeInput.instances.length);
    }

    private createPincodeGrids(id: number): PincodeInput {
        const options: PincodeInputOptions = this.options;
        const maxLength = this.element.maxLength > 0 ? this.element.maxLength : options.length;

        // Define the finalStyles object that will be aggregated and used later
        let finalStyles: { [key: string]: any } = {};
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
            const grid = Utils.createElem('div') as HTMLDivElement;
            const span = Utils.createElem('span') as HTMLSpanElement;
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
            } else {
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
        (Utils.getElem('.pincode-grid', 'all', pincodeWrapper)).forEach(grid => {
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
            this.element.focus();
        }

        return this;
    }

    // Update the current focus grid based on the length of the input value
    private updateFocus(): void {
        const grids = Array.from(Utils.getElem('.pincode-grid', 'all')) as HTMLDivElement[];
        const valueLength = this.element.value.length;

        grids.forEach((grid, index) => {
            this.element.focus();
            if (index === valueLength) {
                Utils.addClass(grid, 'pincode-focus');
            } else {
                Utils.removeClass(grid, 'pincode-focus');
            }
        });
    }

    // Remove focus from all grids
    private removeFocus(): void {
        const grids = Utils.getElem('.pincode-grid', 'all');
        grids.forEach(grid => {
            Utils.removeClass(grid, 'pincode-focus');
        });
    }

    // Handle input event on the hidden input
    private onPinInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (this.options.forceDigits && input.value) {
            // Remove any non-digit characters from the value
            input.value = input.value.replace(/\D/g, '');
        }
        const placeHolder = this.options.secure ? this.options.placeHolder : undefined;
        if (input.value.length <= input.maxLength) {
            Utils.updateVisiblePinCode(input, this.onInputCallback, this.onCompleteCallback, placeHolder);
            this.updateFocus();
        } else {
            // Prevent the value from exceeding maxLength
            input.value = input.value.slice(0, input.maxLength);
        }
    }

    // Handle keydown event
    private handleKeydown(event: KeyboardEvent): void {
        // Allow paste shortcut (Ctrl+V or Cmd+V) regardless of forceDigits
        const isPasteShortcut = (event.ctrlKey || event.metaKey) && event.key === 'v';
        if (isPasteShortcut) return; // Do not prevent the default paste action

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
    private handleBackspace(): void {
        const value = this.element.value;
        const placeHolder = this.options.secure ? this.options.placeHolder : undefined;
        if (value.length > 0) {
            this.element.value = value.slice(0, value.length - 1);
            Utils.updateVisiblePinCode(this.element, this.onInputCallback, this.onCompleteCallback, placeHolder);
            this.updateFocus();
        }
    }

    // Handle Escape key
    private handleEscape(): void {
        this.clear();
        this.element.blur();
    }

    // Handle paste event
    private handlePaste(event: ClipboardEvent): void {
        if (!this.options.allowPaste) {
            event.preventDefault();
            return;
        }
        const clipboardData = event.clipboardData;
        if (!clipboardData) return;
        const pastedData = clipboardData.getData('text').slice(0, this.element.maxLength);
        if (this.options.forceDigits) {
            // Remove any non-digit characters from the pasted data
            this.element.value = pastedData.replace(/\D/g, '');
        } else {
            this.element.value = pastedData;
        }
        Utils.updateVisiblePinCode(this.element, this.onInputCallback, this.onCompleteCallback, this.options.secure ? this.options.placeHolder : undefined);
        this.updateFocus();
        event.preventDefault(); // Prevent the default paste action
    }

    // Clear the input value
    public clear(): void {
        this.element.value = '';
        this.element.dispatchEvent(new Event('input'));
    }

    // Destroy the instance
    public destroy(): void {
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
    public set onInput(callback: OnChangeCallback) {
        this.onInputCallback = callback;
    }

    public set onComplete(callback: OnCompleteCallback) {
        this.onCompleteCallback = callback;
    }

    // Get the value of the input
    public get value(): string {
        return this.element.value;
    }
}

export default PincodeInput;
