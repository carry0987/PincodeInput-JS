import { PincodeInputOptions } from '@/interface/interfaces';

export const defaults: PincodeInputOptions = {
    autoFocus: false,
    allowEscape: true,
    allowPaste: true,
    secure: false,
    placeHolder: '•',
    forceDigits: true,
    length: 6,
    styles: {},
    onLoad: () => {},
    onInput: (value: string, idx: number) => {},
    onComplete: (value: string) => {}
};
