// @ts-ignore
const request = require('request')

/**
 * @description: request包装成promise函数
 * 文档：https://github.com/request/request#readme
 * @param {Object}	param	参数
 * @param {Object}	param.req request	参数
 * @param {Object}	param.res	response 参数
 * @param {boolean}	param.needPipeRes	是否需要pipe response
 * @param {Object}	options	Request配置项
 * @param {Function}	callback 回调函数
 * @return: 
 */
module.exports = function createRequest(param, options, callback) {
	callback = callback || (() => { })

	// 获取request参数
	let opt = Object.assign(
		{
			uri: undefined, // 请求路径
			method: undefined, // method
			headers: undefined, // 头信息
			json: true, // json只会处理form和body，如果要覆盖写在conf中
			gzip: true // gzip传true才能压缩，具体解法根据response
		},
		options
	)

	/**
   * @description: 创建请求
   * @param {Function} resolve promise
   * @param {Function} reject	promise
   * @return: {Object} 请求对象
   */
	function _createReq(resolve, reject) {
		param.before(param.req, opt)

		return request(opt, (err, httpResponse, data) => {
			// reponse code
			let status = (httpResponse && httpResponse.statusCode) || 'NULL'

			// 请求出错
			if (err) {
				err.status = status
				opt.err = err

				param.after(param.req, opt)
				reject(err, opt.uri)
				return
			}

			// 没有报错，且有正常的返回数据
			if (!err && data) {
				httpResponse.status = status

				param.after(param.req, opt)
				resolve(callback(httpResponse, data, opt.uri))
				return
			}
		})
	}

	return new Promise((resolve, reject) => {
		// 发送请求
		let ProxyServer = _createReq(resolve, reject)

		// 如果req.readable是可读的而且当前请求不为GET 则可以pipe
		if (param.req.readable && param.method !== 'GET') {
			param.req.pipe(ProxyServer)
		}

		if (param.needPipeRes) {
			ProxyServer.pipe(param.res)

			// pipe response到body中
			//  more at:https://github.com/request/request/issues/887#issuecomment-53965077
			// 在文件很大的情况下以下这种方式会有问题：
			// param.req.body = ProxyServer.pipe(Stream.PassThrough())
		}
	})
}
