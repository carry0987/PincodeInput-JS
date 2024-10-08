# PincodeInput-JS
[![NPM](https://img.shields.io/npm/v/@carry0987/pincode-input.svg)](https://www.npmjs.com/package/@carry0987/pincode-input)
![CI](https://github.com/carry0987/PincodeInput-JS/actions/workflows/ci.yml/badge.svg)  
Seamlessly create a user-friendly PIN code input experience with `PincodeInput-JS`. This lightweight JavaScript library is specially designed to handle numeric input fields required for Two-Factor Authentication (2FA) and other security-related use cases. It elegantly manages the focus transition between individual digit fields, ensuring a smooth and intuitive entry process similar to professional financial and security applications.

Features of `PincodeInput-JS` include:
- Auto-focus on next field after each digit is entered.
- Easy navigation back and forth with just the keyboard.
- Paste support allowing users to input a complete code in a single action.
- Customizable input fields for different styles and layouts.
- Built-in validation to ensure only numeric input is accepted.
- Support password mode to hide the input value with custom placeholder.
- Support for both mobile and desktop devices.
- No dependencies on other libraries or frameworks.

## Installation
To install `PincodeInput-JS` in your project, simply run the following command in your terminal:
```bash
pnpm i @carry0987/pincode-input
```

## Usage

#### UMD
You can see the **`UMD`** example here:  
**[Code](./index.html)**  
**[Demo](https://carry0987.github.io/PincodeInput-JS/)**

#### ES Module
```ts
import { PincodeInput } from '@carry0987/pincode-input';

const pincodeInput = new PincodeInput('#pincode', {
    autoFocus: true,
    allowPaste: true,
    secure: false,
    forceDigits: true,
    length: 6,
    styles: {
        '.pincode-grid': {
            'margin': '5px',
            'padding': '5px',
            'width': '50px',
            'text-align': 'center',
            'text-align': 'center',
            'line-height': 'normal',
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center'
        },
        '.pincode-grid.pincode-focus': {
            'border-bottom': '5px solid #007bff'
        }
    },
    onInput: (value, idx) => {
        document.getElementById('pincode-value').innerText = value;
        console.log(idx);
    },
    onComplete: (value) => {
        console.log('Complete', pincodeInput.value);
    }
});
```
