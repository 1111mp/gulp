const merge = require('lodash/merge')
const { NODE_ENV } = process.env

module.exports = merge(
	{},
	{
		// 接口转发相关配置
		proxy: {
			protocol: 'https',
			envPrefix: '', // proxy的前缀'dev.','qa.'...
			apiPublicHost: 'api.npl.pub.netease.com', // 公共服务host
			apiSysHost: 'ngl.pub.netease.com', // 未聚合的接口host
			apiHost: 'api-ngl.pub.netease.com' // 聚合接口的host
		},
	},
	require(`./${NODE_ENV}.config`)
)