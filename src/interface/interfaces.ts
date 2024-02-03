export interface PincodeInputOptions {
    secret?: boolean; // Whether to show the input as password or text
    length?: number; // Maximum length of the input
    onLoad?: () => void; // Callback when the component is loaded
    onChange?: (value: string, idx: number) => void; // Callback when any input changes
    onComplete?: (value: string) => void; // Callback when all inputs are filled
}

export interface PincodeInputInstance {
    elements: HTMLInputElement[];
    options: PincodeInputOptions;
}

export interface ChangeEventDetail {
    value: string; // Current value of the input
    idx: number; // Index of the input where change occurred
}

export interface CompleteEventDetail {
    value: string; // Current value of the input
}

export interface OnChangeCallback {
    (value: string, idx: number): void;
}

export interface OnCompleteCallback {
    (value: string): void;
}

export interface StylesObject {
    [selector: string]: string | number | StylesObject;
}
