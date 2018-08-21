# rollup-plugin-bundle-html
This plugin inject the bundle js file as well as external js files to html template.
This plugin extends from [rollup-plugin-fill-html](https://github.com/alwaysonlinetxm/rollup-plugin-fill-html) to provide
more flexibility for injecting files.

## Installation

    yarn add --dev rollup-plugin-bundle-html

or

    npm install -D rollup-plugin-bundle-html

## Usage
```js
import html from 'rollup-plugin-bundle-html';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/foo/bundle.js',
  },        
  plugins: [
    html({
        template: 'src/template.html',
        dest: "dist/foo",
        filename: 'index.html',
        inject: 'head',
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
## Options

You can pass an option to the `html()` just like above, and there are some options:

- template: Required. the path of the template file, it should be a html file.
- filename: Optional. the name of the result html file, if omitted, the
  template name will be used.
- externals: Optional. a list of files which will be insert into the resule
  html. The file should be a valid url.
- inject: Optional. indicate where to insert files， it can be 'head' or
  'body'. For default, the css files will be inserted into `<head>` and the js
  files will be inserted into `<body>`.
- defaultmode: Optional. specify a value to use in the script `type` attribute.
  If no mode is specified, the `type` attribute is omitted. Externals can
  optionally override this per file.
- dest: Optional. the folder in which js file is searched and be injected to html file.

## License

MIT
