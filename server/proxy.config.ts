/** https://blog.csdn.net/a460550542/article/details/82687197 */

module.exports = {
	'/time': {
		target: 'http://127.0.0.1:5000',
		changeOrigin: true, // 默认false，是否需要改变原始主机头为目标URL
		ws: false, // 是否代理websockets
		pathRewrite: {
			'^/api/old-path': '/api/new-path',     // 重写请求，比如我们源访问的是api/old-path，那么请求会被解析为/api/new-path
		},
		router: {
			// 如果请求主机 == 'dev.localhost:3000',
			// 重写目标服务器 'http://www.example.org' 为 'http://localhost:8000'
			'dev.localhost:3000': 'http://localhost:8000'
		},
		logLevel: 'info',
		onProxyReq: function (proxyReq, req, res) {
			// add custom header to request 
			proxyReq.setHeader('x-added', 'foobar');
			// or log the req 
		}
	}
}