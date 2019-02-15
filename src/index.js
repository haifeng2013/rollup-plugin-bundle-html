import { statSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { relative, basename, sep as pathSeperator } from 'path';
import CleanCss from 'clean-css'
import hasha from 'hasha';

const cheerio = require('cheerio');

function traverse(dir, list, exclude = []) {
	const dirList = readdirSync(dir);
	dirList.forEach(node => {
		const file = `${dir}/${node}`;
		if (!exclude.includes(node)) {
			if (statSync(file).isDirectory()) {
				traverse(file, list, exclude);
			} else {
				if (/\.js$/.test(file)) {
					list.push({ type: 'js', file });
				} else if (/\.css$/.test(file)) {
					list.push({ type: 'css', file });
				}
			}
		}
	});
}

function isURL(url) {
	return (new RegExp('^(?:[a-z]+:)?//', 'i')).test(url);
}

export default (opt = {}) => {
	const { template, filename, externals, inject, dest, inline, minifyCss, exclude } = opt;

	return {
		name: 'html',
		//TODO: generateBundle seems to gives a different result, as the file are not written to disk, but are streamed in memory.
		onwrite(config, data) {
			const $ = cheerio.load(readFileSync(template).toString());
			const head = $('head');
			const body = $('body');
			const { file, sourcemap } = config;
			const fileList = [];
			// relative('./', file) will not be equal to file when file is a absolute path
			const destPath = relative('./', file);
			const destDir = dest || destPath.slice(0, destPath.indexOf(pathSeperator));
			const destFile = `${destDir}/${filename || basename(template)}`;

			traverse(destDir, fileList, exclude);

			if (Array.isArray(externals)) {
				let firstBundle = 0;
				externals.forEach(function (node) {
					if (node.pos === 'before') {
						fileList.splice(firstBundle++, 0, node);
					} else {
						fileList.splice(fileList.length, 0, node);
					}
				})
			}

			fileList.forEach(node => {
				let { type, file } = node;
				let hash = '';
				let code = '';
				const isHash = /\[hash\]/.test(file);

				if (inline || isHash) {
					if (file === destPath) {
						// data.code will remove the last line of the source code(//# sourceMappingURL=xxx), so it's needed to add this
						code = `${data.code}//# sourceMappingURL=${basename(file)}.map`;
					} else {
						code = readFileSync(file).toString();
					}
				}

				if (isHash) {
					if (sourcemap) {
						let srcmapFile = file + ".map";
						let srcmapCode = readFileSync(srcmapFile).toString();
						let srcmapHash = hasha(srcmapCode, { algorithm: 'md5' });

						// remove the source map file without hash
						unlinkSync(srcmapFile);
						srcmapFile = srcmapFile.replace('[hash]', srcmapHash);
						writeFileSync(srcmapFile, srcmapCode);

						code = code.replace(`//# sourceMappingURL=${basename(file)}.map`, `//# sourceMappingURL=${basename(srcmapFile)}`)
					}
					hash = hasha(code, { algorithm: 'md5' });
					// remove the file without hash
					unlinkSync(file);
					file = file.replace('[hash]', hash)
					writeFileSync(file, code);
				}

				let src = isURL(file) ? file : relative(destDir, file);

				if (node.timestamp) {
					src += '?t=' + (new Date()).getTime();
				}

				if (type === 'js') {
					const script = `<script type="text/javascript" src="${src}"></script>\n`;
					// node.inject will cover the inject
					if (node.inject === 'head' || inject === 'head') {
						head.append(inline ? `<script type="text/javascript">\n${code}\n</script>` : script);
					} else {
						body.append(inline ? `<script>\n${code}\n</script>` : script);
					}
				} else if (type === 'css') {
					let style;
					if (inline) {
						style = `<style>\n${minifyCss ? new CleanCss().minify(code).styles : code}\n</style>`
					}
					else {
						style = `<link rel="stylesheet" href="${src}">\n`;
					}
					head.append(style);
				}
			});
			writeFileSync(destFile, $.html());
		}
	};
}
