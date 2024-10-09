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
interface CompleteEventDetail {
    value: string;
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

type interfaces_CompleteEventDetail = CompleteEventDetail;
type interfaces_OnChangeCallback = OnChangeCallback;
type interfaces_OnCompleteCallback = OnCompleteCallback;
type interfaces_PincodeInputOptions = PincodeInputOptions;
type interfaces_StylesObject = StylesObject;
declare namespace interfaces {
  export type { interfaces_CompleteEventDetail as CompleteEventDetail, interfaces_OnChangeCallback as OnChangeCallback, interfaces_OnCompleteCallback as OnCompleteCallback, interfaces_PincodeInputOptions as PincodeInputOptions, interfaces_StylesObject as StylesObject };
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

export { PincodeInput, interfaces as PincodeInputInterface };
