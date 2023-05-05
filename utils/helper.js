import jQuery from 'jquery'
import { JSDOM } from 'jsdom'
export function removeHtmlTag(content) {
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
export function getDom(html) {
	var dom = new JSDOM(html)
	return jQuery(dom.window)
}

/**延迟函数
 * @param {Number} ms 等待时长
 * @return {Promise} 空数据
 */
export function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, ms)
	})
}
