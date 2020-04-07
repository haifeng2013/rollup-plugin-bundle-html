# rollup-plugin-bundle-html-thomzz
This plugin is forked from ©[rollup-plugin-bundle-html](https://github.com/haifeng2013/rollup-plugin-bundle-html),
and is virtually the same, appart from adding more flexibility for my own needs, and adding an some useful options,
like the possibilty to inline file content directly to the generated html, to exclude files, and to minify inlined css with "clean-css".

## Installation

    yarn add --dev rollup-plugin-bundle-html-thomzz

or

    npm install -D rollup-plugin-bundle-html-thomzz

## Usage
```js
import html from 'rollup-plugin-bundle-html-thomzz';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/foo/bundle.js',
  },
  plugins: [
    html({
        template: 'src/template.html',
        // or html code: '<html><head></head><body></body></html>'
        dest: "dist/foo",
        filename: 'index.html',
        inject: 'head',
        exclude: [
          'workers',
          'externalSlowToBundleFile.js'
        ],
        inline: true,
        minifyCss: true,
        externals: [
            { type: 'js', file: "file1.js", pos: 'before' },
            { type: 'js', file: "file2.js", pos: 'before' }
        ]
    })
  ]
};
```

```html
<!-- src/template.html -->
<html>
  <head>
  </head>
  <body>
  </body>
</html>

<!-- dist/foo/index.html -->
<html>
  <head>
    <script type="text/javascript" src="../../file1.js"></script>
    <script type="text/javascript" src="../../file2.js"></script>
    <script type="text/javascript" src="bundle.js"></script>
  </head>
  <body>
  </body>
</html>
```

## Hash

You can set string '[hash]' for output file in rollup.config.js, and your bundle and source map (if you turned on
sourcemap option) will have the string '[hash]' be replaced by its hash.
```js
export default {
  input: 'src/main.js',
  output: {
    file: 'dist/foo/bundle-[hash].js',
    // Turn on sourcemap
    sourcemap: true
  },
  plugins: [
    ...
  ]
};
```
You will find both bundle and map files are hashed and placed in your `dist/foo` folder:
 `bundle-76bf4fb5dbbd62f0fa3708aa3d8a9350.js`, `bundle-84e0f899735b1e320e625c9a5c7c49a7.js.map`

## onlinePath

You can set 'onlinePath' as anything like `//www.sohu.com/` if you want to put the files on CDN after building.

```js
{
  output: {
    file: 'dist/foo/main.js',
  },
  // ...
  plugins: [
    html({
        dest: "dist/foo",
        // ...
        onlinePath: '//www.sohu.com/dist/foo'
    })
  ]
}
```

and you will get something like: `<script src="//www.sohu.com/dist/foo/main.js"></script>`.

## Options

You can pass an option to the `html()` just like above, and there are some options:

- template: Required. the path of the template file, it should be a html file.
- filename: Optional. the name of the result html file, if omitted, the
  template name will be used.
- exclude: Optional. An array containing all files to ignore when scanning the build directory.
  Specifying a directory name will make all children files ignored.
- inline: Optional. The files content will be directly inlined into the html.
- minifyCss: Optional. This options apply only if inline options is set to true, and if css files are present in the bundle directory.
  the css will be minified with "clean-css" before being appended to the `<head>` of the document.
- clean: Optional. indicate if the .js bundle should be removed at the end. (.map will not be removed);
- scriptType: The value to set for the type attribute of the written script tags (text/javascript, module ...).
- externals: Optional. a list of files which will be insert into the resule
  html. The file should be a valid url.
  - externals.__file__: file path.
  - externals.__type__: the type of file. can be 'js' or 'css'.
  - externals.__pos__: position where the file is inserted.
  - externals.__timestamp__: append timestamp as query string to file path.
- __inject__: (*optional*) indicate where to insert files， it can be 'head' or
  'body'. For default, the css files will be inserted into `<head>` and the js
  files will be inserted into `<body>`.
- __dest__: (*optional*) the folder in which js file is searched and be injected to html file.
- __absolute__: (*optional*) indicates is paths of injected files should starts with "/".
- __ignore__: (*optional*) specify a regex that will prevent all matching files from being injected.
- __onlinePath__: (*optional*) add an onlinePath prefix to the file while bundle file would be 
  pushed into CDN instead of a local file.

## License

MIT
