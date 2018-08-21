// import html from 'rollup-plugin-fill-html';
import html from '../src/index';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle-[hash].js',
    format: 'iife',
  },
  plugins: [
    html({
      template: 'src/index.html',
      filename: 'index.html',
      // inject: 'head',
      externals: [
        { type: 'js', file: 'https://test.js', inject: 'head' }
      ]
    })
  ]
};
