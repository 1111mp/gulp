module.exports = {
	isDev: process.env.NODE_ENV === 'dev',

	env: 'dev',

	minimize: false,

	// 打包完成显示包大小的状态分析
	// `npm run build --report`
	bundleAnalyzerReport: process.env.npm_config_report
}