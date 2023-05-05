const jQuery = require('jquery')
const { JSDOM } = require('jsdom')
exports.removeHtmlTag = function (content) {
	content = content.replace(/(?:<\/?[a-z][a-z1-6]{0,9}>|<[a-z][a-z1-6]{0,9} .+?>)/gi, '')
	return content
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&nbsp;/g, ' ')
}

/**通过Html字符串获取Jquery对象
 * @param {String} html - html字符串
 * @return {Function} Jquery
 */
exports.getDom = function (html) {
	var dom = new JSDOM(html)
	return jQuery(dom.window)
}

/**延迟函数
 * @param {Number} ms 等待时长
 * @return {Promise} 空数据
 */
exports.delay = function (ms) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, ms)
	})
}
