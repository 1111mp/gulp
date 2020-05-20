const { resolve } = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WebpackBar = require('webpackbar')
const FirendlyErrorePlugin = require('friendly-errors-webpack-plugin')
const config = require('../../config')

module.exports = {
	mode: 'production',

	entry: {
		vender: ['react', 'react-dom', 'react-router', 'react-router-dom', 'axios', 'mobx', 'mobx-react', 'mobx-react-router', 'path']
	},

	output: {
		path: config.paths.appBuildDll,
		filename: '[name].dll.[chunkhash:8].js',
		library: '_dll_[name]'
	},

	plugins: [
		new CleanWebpackPlugin(),

		new FirendlyErrorePlugin(),

		new webpack.DllPlugin({
			path: resolve(config.paths.appBuildDll, '[name]-manifest.json'),
			name: '_dll_[name]'
		}),

		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: `'${config.isDev ? 'dev' : 'prod'}'`
			}
		}),
		new WebpackBar({
			profile: false,
			name: 'client',
			color: 'green',
			done: states => {
				const hasErrors = Object.values(states).some(state => state.stats.hasErrors())
			}
		})
	]
}