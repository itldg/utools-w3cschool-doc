const fs = require('fs')
const path = require('path')
const jQuery = require('jquery')
const { JSDOM } = require('jsdom')
const hljs = require('highlight.js/lib/common')
const { removeHtmlTag } = require('./helper.js')

const pluginTemplateDir = path.join(__dirname, '../', 'plugin_template')
/**
 * 将指定src目录下的所有文件剪切到指定目标dest目录下
 * @param src 源目录
 * @param dest 目标目录
 */
function copyDirectory(src, dest) {
	var files = fs.readdirSync(src)
	files.forEach((item, index) => {
		var itemPath = path.join(src, item)
		var itemStat = fs.statSync(itemPath) // 获取文件信息
		var savedPath = path.join(dest, itemPath.replace(src, ''))
		var savedDir = savedPath.substring(0, savedPath.lastIndexOf('/'))
		if (itemStat.isFile()) {
			// 如果目录不存在则进行创建
			if (!fs.existsSync(savedDir)) {
				fs.mkdirSync(savedDir, { recursive: true })
			}
			// 写入到新目录下
			var data = fs.readFileSync(itemPath)
			fs.writeFileSync(savedPath, data)
		} else if (itemStat.isDirectory()) {
			copyDirectory(itemPath, path.join(savedDir, item))
		}
	})
}
module.exports = class {
	/**
	 *  @typedef Config
	 *  @type {Object}
	 *  @property {String} name 名称
	 *  @property {String} category 分类目录
	 */

	/**
	 * 初始化插件
	 * @param {Config} config 插件信息
	 */
	constructor(config) {
		this.config = config
		/** 插件目录 */
		this.pluginDir = path.join(__dirname,'../', 'plugins', config.category)
		if (!fs.existsSync(this.pluginDir)) {
			fs.mkdirSync(this.pluginDir)
		}
	}

	/**
	 * 导出插件
	 */
	async exportPlugin() {
		copyDirectory(pluginTemplateDir, this.pluginDir)
		const data = fs.readFileSync(path.join(__dirname,'../', 'logos', this.config.category + '.png'))
		fs.writeFileSync(this.pluginDir + '/logo.png', data)
		const pluginFile = path.join(this.pluginDir, 'plugin.json')
		return new Promise((resolve, reject) => {
			fs.readFile(pluginFile, { encoding: 'utf-8' }, (err, data) => {
				if (err) {
					return reject(err)
				}
				data = data.replace(/\{name\}/g, this.config.name)
				data = data.replace(/\{category\}/g, this.config.category)
				data = data.replace(/\{ver\}/g, this.config.ver)
				fs.writeFileSync(pluginFile, data)
				resolve(data)
			})
		})
	}

	/**
	 * 导出索引Json文件
	 * @param {Array} indexes 索引信息
	 */
	async exportIndex(indexes) {
		fs.writeFileSync(path.join(this.pluginDir, 'indexes.json'), JSON.stringify(indexes, null, 4))
	}

	writeDoc(filename, content, title) {
		const cacheFile = path.join(this.pluginDir, 'docs', path.basename(filename))
		const cacheDir = cacheFile.substring(0, cacheFile.lastIndexOf('/'))
		if (!fs.existsSync(cacheDir)) {
			fs.mkdirSync(cacheDir)
		}

		var dom = new JSDOM()
		var window = dom.window
		var $ = jQuery(window)

		let html = $(`<div><h1>${title}</h1>${content}</div>`)

		const codes = html.find('pre')
		if (codes.length > 0) {
			$(codes).each(function () {
				const lang = $(this).attr('lang')
				if (!lang) {
					return
				}
				// document.body.
				const highlightedCode = hljs.highlight(removeHtmlTag(this.outerHTML), { language: lang }).value
				this.innerHTML = '<code class="' + lang + ' hljs">' + highlightedCode + '</code>'
			})
		}
		fs.writeFileSync(
			cacheFile,
			`<!DOCTYPE html><html lang="zh_CN"><head><meta charset="UTF-8"><title>老大哥文档</title>
	<link rel="stylesheet" href="../static/defualt.css" />
	<link rel="stylesheet" href="../static/project.css" />
	</head>
	<body>${html[0].outerHTML}</body>
	</html>`
		)
	}
}
