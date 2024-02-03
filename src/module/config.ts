import { PincodeInputOptions } from '../interface/interfaces';

export const defaults: PincodeInputOptions = {
    secret: false,
    length: 6,
    styles: {},
    onLoad: undefined,
    onInput: undefined,
    onComplete: undefined
};
