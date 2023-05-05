const https = require('https')
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const { delay } = require('./helper.js')

exports.get = async function (url) {
	const filename = crypto.createHash('md5').update(url.toLowerCase()).digest('hex')
	const cachePath = path.join(__dirname,'../', 'caches', filename)
	if (fs.existsSync(cachePath)) {
		return new Promise((resolve, reject) => {
			fs.readFile(cachePath, { encoding: 'utf-8' }, (err, data) => {
				if (err) {
					return reject(err)
				}
				resolve(data)
			})
		})
	} else {
		await delay(1000)
		return new Promise((resolve, reject) => {
			https.get(url, (res) => {
				if (res.statusCode !== 200) {
					if (res.statusCode === 301 || res.statusCode === 302) {
						return reject(new Error('redirect:' + res.headers['location']))
					}
					if (res.statusCode === 404) {
						return reject(new Error('notfound:' + url))
					}
					return reject(new Error('🥵  获取页面 返回状态码 *** ' + res.statusCode + '\n' + src))
				}
				res.setEncoding('utf8')
				let rawData = ''
				res.on('data', (chunk) => {
					rawData += chunk
				})
				res.on('end', () => {
					const cacheDir = path.join(__dirname,'../', 'caches')
					if (!fs.existsSync(cacheDir)) {
						fs.mkdirSync(cacheDir)
					}
					fs.writeFileSync(cachePath, rawData)
					resolve(rawData)
				})
			})
		})
	}
}
