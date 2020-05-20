'use strict'

const path = require('path')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const webpckPlugins = require('./webpack.config.plugins')
const optimization = require('./webpack.config.optimization')
const Config = require('../config')

module.exports = merge.smart(baseConfig, {
	mode: 'production',

	devtool: false,

	output: {
		path: Config.paths.appBuildBundle
	},

	optimization: optimization(),
	plugins: webpckPlugins.call(Config)
})