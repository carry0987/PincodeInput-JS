import Utils from './utils-ext';
import reportInfo from './report';
import { PincodeInputOptions, OnChangeCallback, OnCompleteCallback } from './interface/interfaces';
import { defaults } from './config';

class PincodeInput {
    private static instances: PincodeInput[] = [];
    private static version: string = '__version__';
    private element!: HTMLInputElement;
    private options!: PincodeInputOptions;
    private targetIndex: number = 0;

    // Methods for external use
    private _onInput: OnChangeCallback | undefined = undefined;
    private _onComplete: OnCompleteCallback | undefined = undefined;

    constructor(element: string | Element, option: PincodeInputOptions = {}) {
        this.init(element, option);
        PincodeInput.instances.push(this);

        if (PincodeInput.instances.length === 1) {
            reportInfo(`PincodeInput is loaded, version: ${PincodeInput.version}`);
        }
    }

    /**
     * Initialization
     */
    private init(element: string | Element, option: PincodeInputOptions): void {
        let elem = Utils.getElem(element);
        if (!elem) Utils.throwError('Element not found');
        if (!(elem instanceof HTMLInputElement)) Utils.throwError('Element must be an input field');
        this.element = elem as HTMLInputElement;
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

    private createPincodeGrids(id: number): PincodeInput {
        const options: PincodeInputOptions = this.options;
        const maxLength = this.element.maxLength > 0 ? this.element.maxLength : options.length;

        // Create a container for pin code block
        const pincodeWrapper = Utils.createElem('div');
        pincodeWrapper.className = 'pincodeInput';

        // Create a container for pin code grids
        const pinCode = Utils.createElem('div');
        pinCode.className = 'pincode';

        // Create visible pin code grids and append them to the wrapper
        for (let i = 0; i < maxLength!; i++) {
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
        this.element.type = options.secret ? 'password' : 'tel';
        this.element.pattern = '[0-9]*';
        this.element.inputMode = 'numeric';
        this.element.maxLength = maxLength!;
        this.element.autocomplete = 'off';
        // Append the original input to the wrapper
        pincodeWrapper.appendChild(this.element);

        // Insert pin code grids into pincode wrapper
        pincodeWrapper.appendChild(pinCode);

        // Bind click events to the grids to focus the hidden input
        (Utils.getElem('.pincode-grid', 'all', pincodeWrapper) as NodeList).forEach(grid => {
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
    private updateFocus(): void {
        const grids = Array.from(Utils.getElem('.pincode-grid', 'all') as NodeList) as HTMLDivElement[];
        const valueLength = this.element.value.length;

        grids.forEach((grid, index) => {
            this.element.focus();
            if (index === valueLength) {
                grid.classList.add('pincode-focus');
            } else {
                grid.classList.remove('pincode-focus');
            }
        });
    }

    // Remove focus from all grids
    private removeFocus(): void {
        const grids = document.querySelectorAll('.pincode-grid');
        grids.forEach(grid => {
            grid.classList.remove('pincode-focus');
        });
    }

    // Handle input event on the hidden input
    private onPinInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.value.length <= input.maxLength) {
            Utils.updateVisiblePinCode(input, this._onInput, this._onComplete);
            this.updateFocus();
        } else {
            // Prevent the value from exceeding maxLength
            input.value = input.value.slice(0, input.maxLength);
        }
    }

    // Handle keydown event
    private handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Backspace') {
            this.handleBackspace();
            event.preventDefault();
        }
    }

    // Handle Backspace key
    private handleBackspace(): void {
        const value = this.element.value;
        if (value.length > 0) {
            this.element.value = value.slice(0, value.length - 1);
            Utils.updateVisiblePinCode(this.element, this._onInput, this._onComplete);
            this.updateFocus();
        }
    }

    destroy(): void {
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
    set onInput(callback: OnChangeCallback) {
        this._onInput = callback;
    }

    set onComplete(callback: OnCompleteCallback) {
        this._onComplete = callback;
    }
}

export default PincodeInput;
