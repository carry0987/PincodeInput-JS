interface PincodeInputOptions {
    autoFocus: boolean;
    allowEscape: boolean;
    allowPaste: boolean;
    secure: boolean;
    placeHolder: string;
    forceDigits: boolean;
    length: number;
    styles: Record<string, StylesObject>;
    onLoad: () => void;
    onInput: (value: string, idx: number) => void;
    onComplete: (value: string) => void;
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
    private onInputCallback;
    private onCompleteCallback;
    constructor(element: string | Element, option?: Partial<PincodeInputOptions>);
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
    private handleEscape;
    private handlePaste;
    clear(): void;
    destroy(): void;
    set onInput(callback: OnChangeCallback);
    set onComplete(callback: OnCompleteCallback);
    get value(): string;
}

export { PincodeInput as default };
