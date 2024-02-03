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

    // Constants for Event Types
    static readonly EVENT_CHANGE = 'change';
    static readonly EVENT_COMPLETE = 'complete';

    // Methods for external use
    private _onChange: OnChangeCallback | undefined = undefined;
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
        this._onChange = option.onChange;
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
            grid.className = 'pincode-grid';
            grid.dataset.index = i.toString();
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
        // Append the original input to the wrapper
        pincodeWrapper.appendChild(this.element);

        // Insert pin code grids into pincode wrapper
        pincodeWrapper.appendChild(pinCode);

        // Bind click events to the grids to focus the hidden input
        (Utils.getElem('.pincode-grid', 'all', pincodeWrapper) as NodeList).forEach(grid => {
            grid.addEventListener('click', () => this.element.focus());
        });

        // Add keyboard event listener for the hidden input
        this.element.addEventListener('keydown', this.handleInput.bind(this));

        // Ensure that clicking on the pincode grids focuses the hidden input
        const grids = Utils.getElem('.pincode-grid', 'all', pincodeWrapper) as NodeList;
        grids.forEach(grid => {
            grid.addEventListener('click', (e) => {
                const ele = e.target as HTMLDivElement;
                this.targetIndex = parseInt(ele.dataset.index!);
                this.element.focus();
                ele.classList.add('focus');
            });
        });

        return this;
    }

    // Method to handle user input
    private handleInput(event: KeyboardEvent): void {
        if (event.key === 'Backspace' && this.element.value.length) {
            this.element.value = this.element.value.slice(0, -1);
        } else if (/\d/.test(event.key) && this.element.value.length < this.element.maxLength) {
            this.element.value += event.key;
        }
        // Update the visible pin code grids
        Utils.updateVisiblePinCode(this.element, this._onChange, this._onComplete);
        // Prevent the default input action
        event.preventDefault();
    }

    // Method to handle the backspace event
    private handleBackspace(event: KeyboardEvent): void {
        if (event.key === 'Backspace' && this.element.value.length) {
            this.element.value = this.element.value.slice(0, -1);
            Utils.updateVisiblePinCode(this.element, this._onChange, this._onComplete);
        }
    }

    // Trigger event
    private triggerEvent(eventType: string, value: string, idx: number): void {
        switch (eventType) {
            case PincodeInput.EVENT_CHANGE:
                this._onChange?.(value, idx);
                break;
            case PincodeInput.EVENT_COMPLETE:
                this._onComplete?.(value);
                break;
            default:
                Utils.throwError(`Unsupported event type: ${eventType}`);
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
    set onChange(callback: OnChangeCallback) {
        this._onChange = callback;
    }

    set onComplete(callback: OnCompleteCallback) {
        this._onComplete = callback;
    }

    // Other helpful methods can be added here (e.g., getPincode, reset, etc.)
}

export default PincodeInput;
