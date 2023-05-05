const w3c = require('./w3cschool.js')
const addLog = require('./utils/log.js')
const config = require('./config.js')
const Plugin = require('./utils/plugin.js')

async function make() {
	while (config.length > 0) {
		const item = config.shift()
		addLog(`🍺 开始采集 ${item.name}`, true)
		w3c.setCategory(item.category)
		const plugin = new Plugin(item)
		addLog('正在获取目录...')
		const resultList = await w3c.getList()
		let urls = w3c.getUrls()
		let indexes = w3c.getIndexes()
		let allUrls = w3c.getAllUrls()
		plugin.writeDoc('index.html', resultList.content, resultList.title)
		while (urls.length > 0) {
			const { url, referer } = urls.shift()
			addLog(`${(indexes.length + 1).toString().padStart(4, ' ')}/${allUrls.size.toString().padEnd(4, ' ')}: ${url}`)

			try {
				const result = await w3c.getContent(url)
				plugin.writeDoc(url, result.content, result.title)
			} catch (e) {
				addLog('请求出错:' + url, true)
				addLog('来路页面:' + referer, true)
				addLog(e, true)
			}
		}
		await plugin.exportPlugin()
		await plugin.exportIndex(indexes)
		addLog(`✅ 采集完成 ${item.name}, 共分析 ${allUrls.size + 1} 个网址, 整理了 ${indexes.length} 篇文档`, true)
	}
}
make()
