const ProxyUrl = require('./models/proxyUrl')

/**
 * 注册路由以及，接口转发
 */

module.exports = function () {
	return async (req, res, next) => {
		// 保证路由部分最后执行
		await next()

		let proxy = ProxyUrl(req, res)

		try {

			if (proxy) {
				/**在这里可以做一下自定义的操作 比如 接口鉴权 往headers写token等验证信息 */

				const payload = await req.proxy({ url: proxy.path }, proxy.host)

				if (payload.status !== 200) { // 记录错误请求
					req.log4js.apiError(null, req, {
						'proxy_host': proxy.host,
						'proxy_path': proxy.path,
						payload
					})
				} else {
					req.log4js.apiAccess(req, {
						'proxy_host': proxy.host,
						'proxy_path': proxy.path,
						payload
					})
				}

				res.json(payload)
				return
			}

		} catch (e) {

			// 记录api请求错误
			if (e.status === 401) { // 鉴权错误特殊处理
				req.log4js.apiError(e, req, {
					'proxy_host': proxy.host,
					'proxy_path': proxy.path,
					message: e.message
				})

				res.json({
					status: 401,
					message: e.message
				})

				return
			} else {
				req.log4js.apiError(e, req, {
					'proxy_host': proxy.host,
					'proxy_path': proxy.path
				})
			}

			// await res.render('500', {
			// 	title: '',
			// 	gData: {}
			// })

			return
		}

		if (req.path.match(/^\/napi/)) { // node层api，不需要附加鉴权信息。鉴权信息是给api网关使用
			return
		}

		// await req.render('index', {
		// 	title: '',
		// 	gData: getPlatform(req)
		// })

	}
}
