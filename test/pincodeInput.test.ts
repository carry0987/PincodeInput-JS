import PincodeInput from '@/pincodeInput';
import { PincodeInputOptions } from '@/interface/interfaces';
import { describe, it, expect, beforeEach } from 'vitest';

describe('PincodeInput', () => {
    let element: HTMLInputElement;

    beforeEach(() => {
        // Setup a basic HTML input element for testing
        element = document.createElement('input');
        element.type = 'text';
        element.maxLength = 4;
        document.body.appendChild(element);
    });

    it('should initialize correctly', () => {
        const pincode = new PincodeInput(element);
        const instance = Reflect.get(PincodeInput, 'instances');

        expect(instance.length).toBe(1); // Check if an instance is added
    });

    it('should handle input event', () => {
        const pincode = new PincodeInput(element);
        const event = new Event('input', { bubbles: true });
        element.value = '1234';
        element.dispatchEvent(event);

        expect(element.value).toBe('1234'); // Check if value is correctly updated
    });

    it('should limit input to digits if forceDigits is true', () => {
        const options: Partial<PincodeInputOptions> = { forceDigits: true };
        const pincode = new PincodeInput(element, options);
        const event = new KeyboardEvent('keydown', { key: 'a' });
        element.dispatchEvent(event);

        expect(element.value).toBe(''); // Value should remain unchanged if non-digit is entered
    });

    it('should clear the input value', () => {
        const pincode = new PincodeInput(element);
        element.value = '1234';
        pincode.clear();

        expect(element.value).toBe(''); // Check if clear method empties the input value
    });

    it('should destroy the instance', () => {
        const pincode = new PincodeInput(element);
        const instance = Reflect.get(PincodeInput, 'instances');
        pincode.destroy();

        expect(instance.length).toBe(4); // Check if the current instance is removed
    });
});
