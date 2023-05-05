/**
 * 清空控制台缓存
 */
function flush() {
	process.stdout.clearLine()
	process.stdout.cursorTo(0)
}
/**
 * 打印日志
 * @param {String} msg 要打印的日志内容
 * @param {Boolean} newLine 是否打印后换行
 */
export default function(msg = '', newLine = false) {
	flush()
	if (newLine) {
		console.log(msg)
	} else {
		process.stdout.write(msg + '\r')
	}
}
