const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const Config = require('../config')

const defaultOptimization = {
	sideEffects: true,
	minimize: Config.minimize,
	minimizer: Config.minimize
		? [
			new TerserPlugin({
				cache: false,
				parallel: true,
				sourceMap: false, // Must be set to true if using source-maps in production
				terserOptions: {
					// https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
				}
			}),
			new OptimizeCSSAssetsPlugin({
				cssProcessorOptions: {
					safe: true,
					autoprefixer: { disable: true }, // 不处理前缀
					discardComments: {
						removeAll: true // 移除注释
					},
					map: false
				}
			})
		]
		: []
}

/** https://juejin.im/post/5b99b9cd6fb9a05cff32007a */
module.exports = function optimization(isServer) {
	return isServer
		? defaultOptimization
		: Object.assign(
			defaultOptimization,
			{
				splitChunks: {
					cacheGroups: {
						styles: {
							name: 'styles',
							test: /\.(css|styl)$/,
							chunks: 'all',
							enforce: true
						},
					},
				}
			}
		)
}