import fs from 'fs';
import path from 'path';
import buble from '@rollup/plugin-buble';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import styles from "rollup-plugin-styles";
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const { dependencies } = require('./package.json');

const name = 'clippy'
const dist = path.resolve(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
}

module.exports = [{
    input: {
        index: 'src/index.ts',
    },
    external: Object.keys(dependencies),
    plugins: [
        typescript(),
        styles(),
        buble(),
        nodeResolve({
            browser: true,
        }),
        image({
            dom: false,
            include: /\.(png|jpg)$/,
        }),
        commonjs(),
        terser(),
    ],
    output: [
        {
            
            name: 'clippy',
            dir: 'dist',
            format: 'umd',
            sourcemap: true,
        },
    ]
},
];
