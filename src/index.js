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
	const { template, filename, clean, externals, scriptType, inject, dest, absolute, inline, minifyCss, ignore, exclude, onlinePath } = opt;

	return {
		name: 'html',
		writeBundle(config, data) {
			const isHTML = /^.*<html>.*<\/html>$/.test(template);
			const $ = cheerio.load(isHTML?template:readFileSync(template).toString());
			const head = $('head');
			const body = $('body');
			let entryConfig = {};
			Object.values(config).forEach((c) => {
				if (c.isEntry) entryConfig = c
			})
			const { fileName,	sourcemap } = entryConfig
			const fileList = [];
			// relative('./', file) will not be equal to file when file is a absolute path
			const destPath = relative('./', fileName);
			const destDir = dest || destPath.slice(0, destPath.indexOf(pathSeperator));
			const destFile = `${destDir}/${filename || basename(template)}`;
			const absolutePathPrefix = absolute ? '/' : '';

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
				if (ignore && file.match(ignore)) {
					return;
				}

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

				
				let src = isURL(file) ? file : absolutePathPrefix + relative(destDir, file).replace(/\\/g, '/');
				if (onlinePath) { 
					const filename = file.split('/').slice(-1)[0];
					const slash = onlinePath.slice(-1) === '/' ? '' : '/';
					src = onlinePath + slash + filename;
				}
				if (node.timestamp) {
                    src += '?t=' + (new Date()).getTime();
				}

				if (type === 'js') {
					const script = `<script type="text/javascript" src="${src}"></script>\n`;
					const content = inline ? `<script type=${scriptType ? scriptType : "text/javascript"}>\n${code}\n</script>\n` : script;
					inject === "head" ? head.append(content) : body.append(content);
				} else if (type === 'css') {
					const style = `<link rel="stylesheet" href="${src}">\n`;
					const content = inline ? `<style>\n${minifyCss ? new CleanCss().minify(code).styles : code}\n</style>\n` : style;
					head.append(content);
				}
			});
			if (clean) fileList.forEach(f => unlinkSync(f.file));
			writeFileSync(destFile, $.html());
		}
	};
}
