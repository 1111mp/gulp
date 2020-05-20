/**
 * 获取proxy请求地址，配对webapi的地址
 * 规则按实际需求自己定
 */
const config = require('../config')

function getProxyObject(params = []) {
	let host = ''
	let path = ''
	let service = params[0].split('-')
	// let isPublic = params[0] !== 'api-public' // api-public为聚合层路由
	//   && service.length > 1
	//   && service[service.length - 1] === 'public'
	let isPublic = params[0] === 'npl-public'
	let isWebApi = service.length > 1
		&& service[service.length - 1] === 'api'
	let {
		apiPublicHost,
		apiSysHost,
		apiHost
	} = config.proxy

	if (isPublic) {
		// service.splice(service.length - 1, 1)
		// host = `${service.join('.')}.${apiPublicHost}`
		host = `${apiPublicHost}`
		params.splice(0, 1)
		path = params.join('/')
	} else if (isWebApi) {
		service.splice(service.length - 1, 1)
		host = `${service.join('.')}.${apiSysHost}`
		params.splice(0, 1)
		path = params.join('/')
	} else {
		host = apiHost
		path = params.join('/')
	}

	return { host, path }
}

module.exports = function (req, res) {
	const path = req.path

	// 只对前端发起的接口进行接口转发
	if (path.match(/^\/webapi/)) {
		let params = path.substr(1).split('/')
		params.splice(0, 1) // 丢弃webapi

		let proxy = getProxyObject(params)

		return {
			host: `//${config.proxy.envPrefix || ''}${proxy.host}`,
			path: `/${proxy.path}`
		}
	}

	return null
}
