import fs  from 'fs';
import path from 'path';
import buble from '@rollup/plugin-buble';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const { dependencies } = require('./package.json');

const name = 'clippy'
const dist = path.resolve(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
}

module.exports = {
    input: 'dist-tsc/lib/index.js',
    external: Object.keys(dependencies),
    plugins: [
        buble(),
        nodeResolve({ external: ['vue'] }),
        commonjs(),
        // uglify({}, minify)
    ],
    output: [
        {
            file: dist + '/' + name + '.js',
            format: 'umd',
            name: name,
            sourcemap: true,
            globals: {
              jquery: '$'
            }
            
        },
        {
            format: 'es',
            file: dist + '/' + name + '.esm.js',
            sourcemap: true,
            globals: {
              jquery: '$'
            }
        }
    ]
};
