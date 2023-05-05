import addLog from './utils/log.js'
import * as w3c from './w3cschool.js'
import config from './config.js'
import Plugin from './utils/plugin.js'

async function make() {
	while (config.length > 0) {
		const item = config.shift()
		addLog(`🍺 开始采集 ${item.name}`, true)
		w3c.setCategory(item.category)
		const plugin = new Plugin(item)
		addLog('正在获取目录...')
		const resultList = await w3c.getList()
		plugin.writeDoc('index.html', resultList.content, resultList.title)
		while (w3c.urls.length > 0) {
			const { url, referer } = w3c.urls.shift()
			addLog(`${(w3c.indexes.length + 1).toString().padStart(4, ' ')}/${w3c.urlAll.size.toString().padEnd(4, ' ')}: ${url}`)

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
		await plugin.exportIndex(w3c.indexes)
		addLog(`✅ 采集完成 ${item.name}, 共分析 ${w3c.urlAll.size + 1} 个网址, 整理了 ${w3c.indexes.length} 篇文档`, true)
	}
}
make()
