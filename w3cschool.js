const { getDom } = require('./utils/helper.js')
const { get } = require('./utils/http.js')
const path = require('path')

const host = 'www.w3cschool.cn'
const protocol = 'https:'
/**
 * 分类目录名称
 */
let categroyName = ''

let categoryDir = ''

/**
 * 待采集的网址列表
 */
let urls = []

/**
 * 所有网址列表
 */
let urlAll = new Set()

/**
 * 获取待采集的网址列表
 * @return {Array}
 */
exports.getUrls = () => urls

/**
 * 获取所有网址列表,包含采集过的和未采集的
 * @return {Set}
 */
exports.getAllUrls = () => urlAll

/**
 * 索引列表
 */
let indexes = []

/**
 * 获取索引列表
 * @return {Array}
 */
exports.getIndexes = () => indexes
/**
 * 添加网址,如果列表中已存在则跳过
 * @param {String} url 要添加的网址
 * @param {String} referer 获得该网址的来路网址
 */
function addUrl(url, referer) {
	if (!urlAll.has(url)) {
		urlAll.add(url)
		urls.push({ url, referer })
	}
}

/**
 * 设置要采集的分类,初始化操作
 * @param {String} name 目录名
 */
exports.setCategory = function (name) {
	categroyName = name
	categoryDir = `/${name}/`
	indexes = []
	urlAll = new Set()
	urls = []
}

/**
 * 获取列表
 * @return {*}
 */
exports.getList = async function () {
	const url = `${protocol}//${host}/${categroyName}/`
	urlAll.add(url)
	const html = await get(url)
	const $ = getDom(html)
	var $as = $('.dd-item a[href]')
	hrefChange($as, url)
	const title = $('h1').text()
	const desc = [...$('.project-desc')]

	const content = desc
		.map((item) => {
			return item.outerHTML
		})
		.join('')
	const htmlEl = $(`<div>${content}</div>`)
	imgChange(htmlEl, url)
	const short = htmlEl.text().trim()
	indexes.push({
		t: title,
		p: 'docs/index.html',
		d: short,
	})
	return {
		title,
		content: htmlEl.html(),
	}
}

/**
 *  @typedef Content
 *  @type {Object}
 *  @property {String} title 标题信息
 *  @property {String} content 内容Html
 */

/**
 * 获取内容
 * @param {String} url 要采集的地址
 * @return {Content} 采集结果
 */
exports.getContent = async function (url) {
	const html = await get(url)
	let $ = getDom(html)
	var $as = $('.dd-item a[href]')
	hrefChange($as, url)
	const title = $('#pro-mian-header h1').text()
	const time = $('#pro-mian-header .kn-infomation')
	const createdAt = $(time).attr('title')
	const updatedAt = $(time).text()
	const timeStr = `<p class="kn-infomation">${createdAt} | ${updatedAt}</p>`
	const contentEl = $('.content-bg')
	imgChange(contentEl, url)
	const as = $(contentEl).find('a')
	hrefChange(as, url)

	const content = timeStr + $(contentEl).html()
	indexes.push({
		t: title,
		p: 'docs/' + path.basename(url),
		d: $('.content-bg').text().trim(),
	})
	return {
		title,
		content,
	}
}

/**
 * 网址路径还原,如果是教程地址,改为本窗口打开,去除前缀
 * @param {*} as 链接列表
 * @param {String} url 来路地址
 */
function hrefChange(as, url) {
	as.each(function () {
		let newUrl = new URL(this.href, url)
		this.href = newUrl.href
		if (newUrl.host != host) {
			return
		}
		if (!newUrl.pathname.toLocaleLowerCase().startsWith(categoryDir)) {
			return
		}
		let href = newUrl.href
		if (href.includes('%') || href.endsWith('/')) {
			return
		}
		if (!href.endsWith('.html')) {
			href += '.html'
		}
		this.href = path.basename(href)
		this.target = '_self'
		addUrl(href, url)
	})
}

function imgChange(el, url) {
	let imgs = el.find('img[src]')
	if (imgs.length > 0) {
		imgs.each(function () {
			let newUrl = new URL(this.src, url)
			this.src = newUrl.href
		})
	}
}
