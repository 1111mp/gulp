export { }
const path = require("path")
// const fs = require("fs")
// const morgan = require('morgan')
const log4js = require('log4js')
const root = path.resolve(__dirname, '../..')
const env = process.env

const { NODE_ENV } = env
// const FileStreamRotator = require('file-stream-rotator')
const ip = require('./ip')
// const logDirectory = path.join(__dirname, '../../log')
const merge = require('lodash/merge')

let config = merge({}, { logConfig: path.resolve(root, 'bin/log4js.json') })

function getBaseInfo(req) {
	return {
		// host: ctx.headers ? ctx.headers.host : '',
		s_ip: ip.server(),
		c_ip: ip.client(req),
		query_string: JSON.stringify(req.query)
	}
}

const log = {
	// 控制台输出
	con(str, req) {
		const logger = log4js.getLogger('console')
		logger.debug(str)
	},
	apiAccess(req, log = {}) {
		try {
			const logger = log4js.getLogger('api-access')
			logger.info(JSON.stringify(Object.assign(getBaseInfo(req), {
				url: req.url,
				method: req.method
			}, log)))
		} catch (e) {
			console.error(e)
		}
	},
	apiError(err, req, log = {}) {
		try {
			const logger = log4js.getLogger('api-error')
			logger.error(JSON.stringify(Object.assign(getBaseInfo(req), {
				url: req.url,
				stack: err && (err.stack || err.toString())
			}, log)))
		} catch (e) {
			console.error(e)
		}
	},
	// 记录错误日志
	error(err, req) {
		try {
			const logger = log4js.getLogger('error')
			logger.error(JSON.stringify(Object.assign(getBaseInfo(req), {
				url: req.url,
				stack: err && (err.stack || err.toString())
			})))
		} catch (e) {
			console.log(e)
		}
	}
}

module.exports = {
	log,

	createLogger: function () {
		// 根据log 配置文件(log4js.json)配置日志文件
		let logConf = config.logConfig

		// pm2在cluster无法输出日志，需要设置pm2=true才能够正常输出日志
		if (NODE_ENV === 'prod') {
			logConf.pm2 = true
		}

		log4js.configure(logConf)

		return log4js.connectLogger(log4js.getLogger('http'), {
			format: function (req, res, fn) {
				const info = {
					url: fn(':url'),
					method: fn(':method'),
					status: fn(':status'),
					referrer: fn(':referrer'),
					'remote-addr': fn(':remote-addr'),
					'response-time': fn(':response-time'),
					'user-agent': fn(':user-agent')
				}

				// if (info.status == 500) { // 记录500
				//   const logger = log4js.getLogger('error')
				//   logger.error(JSON.stringify(Object.assign(getBaseInfo(ctx), info)))
				// }

				return JSON.stringify(Object.assign(getBaseInfo(req), info))
			}
		})
	}
}

// module.exports = function () {
// 	//确保存储的路径存在
// 	fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// 	const accessLogStream = FileStreamRotator.getStream({
// 		date_format: 'YYYYMMDD',
// 		filename: path.join(logDirectory, '%DATE%-access.log'),
// 		frequency: 'daily',
// 		verbose: false
// 	})

// 	//写正常访问请求的log日志
// 	// return morgan(':date :remote-addr :method :referrer :url :status :res[content-length] - :response-time ms', { stream: accessLogStream })

// 	return morgan(function (tokens, req, res) {
// 		return [
// 			`s_ip: ${ipObj.server()}`,
// 			`c_ip: ${ipObj.client(req)}`,
// 			`query_string: ${JSON.stringify(req.query)}`,
// 			`date: ${tokens.date(req, res)}`,
// 			`method: ${tokens.method(req, res)}`,
// 			`url: ${tokens.url(req, res)}`,
// 			`status: ${tokens.status(req, res)}`,
// 			`referrer: ${tokens.referrer(req, res)}`,
// 			`remote-addr: ${tokens['remote-addr'](req, res)}`,
// 			`response-time: ${tokens['response-time'](req, res)} ms`,
// 			`user-agent: ${tokens['user-agent'](req, res)}`
// 		].join(' ')
// 	}, { stream: accessLogStream })
// }
