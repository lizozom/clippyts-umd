const fs = require('fs');
const path = require('path');
const buble = require('rollup-plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
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
    // moduleName: name,
    plugins: [
        buble(),
        resolve({ external: ['vue'] }),
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
