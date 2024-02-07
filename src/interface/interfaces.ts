export interface PincodeInputOptions {
    autoFocus?: boolean; // Whether to focus on the input when the component is loaded
    secure?: boolean; // Whether to show the input as password or text
    placeHolder?: string; // Placeholder for the secure input
    forceDigits?: boolean; // Whether to force the input to be digits only
    length?: number; // Maximum length of the input
    styles?: Record<string, StylesObject>; // Styles for the pincode input
    onLoad?: () => void; // Callback when the component is loaded
    onInput?: (value: string, idx: number) => void; // Callback when any input changes
    onComplete?: (value: string) => void; // Callback when all inputs are filled
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
