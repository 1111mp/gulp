'use strict'

const path = require('path')
const Config = require('../config')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
	context: Config.rootPath,

	entry: [Config.paths.appIndexJs],

	output: {
		filename: 'assets/js/[name].[hash:6].js',
		chunkFilename: 'assets/js/[id].[hash:6].js',
		publicPath: Config.publicPath	// 配置引入便宜后的文件的路径，这里配置为服务器下的根路径
	},

	resolve: {
		modules: ['node_modules', Config.paths.appNodeModules],

		extensions: ['.tsx', '.ts', '.js', '.json', '.styl'],

		alias: Object.assign({
			"~": Config.paths.src,
			"@": Config.paths.src
		}, Config.paths.appAlias)
	},

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				include: [Config.paths.src],
				use: [
					{
						loader: 'ts-loader',
						options: {
							// disable type checker - we will use it in fork plugin
							transpileOnly: true,
							configFile: Config.paths.appTsConfig
						}
					}
				]
			},
			{
				test: /\.(jsx|js)$/,
				exclude: /(node_modules)/,  //排除掉nod_modules,优化打包速度
				use: [
					{
						loader: 'cache-loader',
						options: {
							cacheDirectory: path.resolve(Config.rootPath, '.cache')
						}
					},
					{
						loader: 'babel-loader'
					}
				]
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							publicPath: './'
						}
					},
					// {
					// 	loader: 'style-loader'
					// },
					{
						loader: 'css-loader',
						options: {
							modules: {
								localIdentName: '[name]__[local]__[hash:base64:5]'
							},
							sourceMap: true,
							importLoaders: 1
						}
					}
				],
			},
			{
				test: /\.styl(us)?$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					// {
					// 	loader: 'style-loader'
					// },
					{
						loader: 'css-loader',
						options: {
							modules: {
								localIdentName: '[name]__[local]__[hash:base64:5]'
							},
							sourceMap: true,
							importLoaders: 1
						}
					},
					{
						loader: 'stylus-loader',
						options: {
							sourceMap: true
						}
					}
				]
			},
			{
				test: /.(png|jpe?g|gif|svg)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 2000,
					name: 'assets/images/[hash:6].[ext]'
				}
			},
			{
				test: /.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 6000,
					name: 'assets/media/[hash:6].[ext]'
				}
			},
			{
				test: /.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 2000,
					name: 'assets/font/[hash:6].[ext]'
				}
			}
		]
	},
	plugins: [],

	target: Config.target,

	// Some libraries import Node modules but don't use them in the browser.
	// Tell Webpack to provide empty mocks for them so importing them works.
	node:
		Config.target === 'web'
			? {
				dgram: 'empty',
				fs: 'empty',
				net: 'empty',
				tls: 'empty',
				child_process: 'empty'
			}
			: {}
}