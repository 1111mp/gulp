// @ts-ignore
const buildConfig = require('./build/config')
console.log(buildConfig)

/** 配置文档 https://github.com/teambition/gulp-ssh */
module.exports = {
	ssh: { // 正式
		host: '192.168.31.227',
		port: 8000,
		username: 'root',
		password: 'a1234567',
	},
	commands: [
		// 删除现有文件
		`rm -rf ${buildConfig.cleanPath}`,
	],
}