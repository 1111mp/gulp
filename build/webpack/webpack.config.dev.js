const path = require('path')
const merge = require('webpack-merge')
const Config = require('../config')
const baseConfig = require('./webpack.config.base')
const webpckPlugins = require('./webpack.config.plugins')
const optimization = require('./webpack.config.optimization')

module.exports = merge.smart(baseConfig, {
	devtool: 'inline-source-map',

	mode: 'development',

	entry: ['webpack-hot-middleware/client?noInfo=true&reload=true'],

	output: {
		path: Config.paths.appBuildBundle
	},

	optimization: optimization(),

	plugins: webpckPlugins.call(Config)
})