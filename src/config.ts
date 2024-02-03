import { PincodeInputOptions } from './interface/interfaces';

export const defaults: PincodeInputOptions = {
    secret: false,
    length: 6,
    onLoad: undefined,
    onInput: undefined,
    onComplete: undefined
};
