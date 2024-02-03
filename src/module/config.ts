import { PincodeInputOptions } from '../interface/interfaces';

export const defaults: PincodeInputOptions = {
    secure: false,
    placeHolder: '•',
    length: 6,
    styles: {},
    onLoad: undefined,
    onInput: undefined,
    onComplete: undefined
};
