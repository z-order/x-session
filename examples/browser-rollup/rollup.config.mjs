/*
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');

const plugins = [nodeResolve({ browser: true }), terser()];
module.exports = [
  {
    input: './example.js',
    output: {
      file: 'dist/example.js',
      format: 'esm', // 'iife', 'umd', 'cjs', 'esm', 'system', 'amd', 'es', 'systemjs': https://rollupjs.org/guide/en/#outputformat
    },
    plugins,
  },
];
*/

import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
//import builtins from 'rollup-plugin-node-builtins'; // has vulnerabilities
//import { terser } from "rollup-plugin-terser"; // deprecated, and version conflict with rollup 3.x

export default {
  input: './example.js',
  external: ['node:crypto', 'buffer', 'stream', 'util', 'crypto'],
  output: {
    file: 'dist/example.js',
    //format: 'esm', // 'iife', 'umd', 'cjs', 'esm', 'system', 'amd', 'es', 'systemjs': https://rollupjs.org/guide/en/#outputformat
    format: 'iife', // iife format is used for browsers
    name: 'exampleModule',
    globals: {
      // Use "output.globals" to specify browser global variable names corresponding to external modules:
      //  - https://rollupjs.org/guide/en/#outputglobals
      'node:crypto': 'crypto',
      buffer: 'buffer',
      stream: 'stream',
      util: 'util',
      crypto: 'crypto',
    },
  },
  plugins: [
    nodeResolve({ browser: true }), // resolve node_modules
    commonjs(), // convert CommonJS modules to ES6
    globals(), // insert node globals
    //builtins(), // insert node builtins
    //terser(),  // minify, for production
  ],
};
