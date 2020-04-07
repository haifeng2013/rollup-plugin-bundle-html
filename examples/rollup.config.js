// import html from 'rollup-plugin-bundle-html';
import html from '../src/index';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/foo/bundle-[hash].js',
    format: 'iife',
  },
  plugins: [
    html({
      template: 'src/index.html',
      filename: 'index.html',
      dest: "dist/",
      onlinePath: '//www.sohu.com/test/',
      // inject: 'head',
      externals: [
        { type: 'js', file: 'https://test.js', inject: 'head' }
      ]
    })
  ]
};
