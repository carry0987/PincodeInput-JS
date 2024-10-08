import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';
import nodeResolve from '@rollup/plugin-node-resolve';
import { dts } from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';
import del from 'rollup-plugin-delete';
import { createRequire } from 'module';
import path from 'path';

const pkg = createRequire(import.meta.url)('./package.json');
const isProduction = process.env.BUILD === 'production';
const sourceFile = 'src/pincodeInput.ts';

// JS Config
const jsConfig = {
    input: sourceFile,
    output: [
        {
            file: pkg.exports['.']['umd'],
            format: 'umd',
            name: 'PincodeInput',
            plugins: isProduction ? [terser()] : []
        }
    ],
    plugins: [
        postcss({
            extract: path.resolve(pkg.exports['./style/pincodeInput.min.css']),
            minimize: true,
            sourceMap: false
        }),
        typescript(),
        tsConfigPaths(),
        nodeResolve(),
        replace({
            preventAssignment: true,
            __version__: pkg.version
        })
    ]
};

// ES Config
const esConfig = {
    input: sourceFile,
    output: [
        {
            file: pkg.exports['.']['import'],
            format: 'es'
        }
    ],
    plugins: [
        postcss({
            inject: false,
            extract: false,
            sourceMap: false
        }),
        typescript(),
        tsConfigPaths(),
        nodeResolve(),
        replace({
            preventAssignment: true,
            __version__: pkg.version
        })
    ]
};

// DTS Config
const dtsConfig = {
    input: sourceFile,
    output: {
        file: pkg.exports['.']['types'],
        format: 'es'
    },
    external: [/\.css$/u],
    plugins: [
        tsConfigPaths(),
        dts(),
        del({ hook: 'buildEnd', targets: ['dist/dts'] })
    ]
};

export default [jsConfig, esConfig, dtsConfig];
