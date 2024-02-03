import { PincodeInputOptions } from './interface/interfaces';

export const defaults: PincodeInputOptions = {
    secret: false,
    length: 6,
    onLoad: undefined,
    onChange: undefined,
    onComplete: undefined
};
