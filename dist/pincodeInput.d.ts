interface PincodeInputOptions {
    secret?: boolean;
    length?: number;
    styles?: Record<string, StylesObject>;
    onLoad?: () => void;
    onInput?: (value: string, idx: number) => void;
    onComplete?: (value: string) => void;
}
interface OnChangeCallback {
    (value: string, idx: number): void;
}
interface OnCompleteCallback {
    (value: string): void;
}
interface StylesObject {
    [selector: string]: string | number | StylesObject;
}

declare class PincodeInput {
    private static instances;
    private static version;
    private element;
    private options;
    private _onInput;
    private _onComplete;
    constructor(element: string | Element, option?: PincodeInputOptions);
    /**
     * Initialization
     */
    private init;
    private createPincodeGrids;
    private updateFocus;
    private removeFocus;
    private onPinInput;
    private handleKeydown;
    private handleBackspace;
    destroy(): void;
    set onInput(callback: OnChangeCallback);
    set onComplete(callback: OnCompleteCallback);
}

export { PincodeInput as default };
