import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
const pkg = require('./package.json');

export default {
  input: 'src/index.js',
  output: [
    { format: 'cjs', file: pkg['main'] },
    { format: 'es', file: pkg['module'] }
  ],
  external: ['fs', 'path', 'crypto', 'clean-css'],
  plugins: [
    resolve(),
    commonjs(),
    buble()
  ]
};
