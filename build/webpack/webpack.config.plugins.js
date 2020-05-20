const Config = require('../config')
const webpack = require('webpack')
const path = require('path')
const WebpackBar = require('webpackbar')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const BundleAnalyzer = require('webpack-bundle-analyzer')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = function webpackPlugins() {
	let hotModulePlugin = [
		// 启用模块热替换(HMR)
		new webpack.HotModuleReplacementPlugin(),
		// 当开启 HMR 的时候使用该插件会显示模块的相对路径，建议用于开发环境。
		new webpack.NamedModulesPlugin(),
		// 在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资源不会包含错误。
		new webpack.NoEmitOnErrorsPlugin()
	]

	let plugins = [
		new CleanWebpackPlugin(),
		// dll
		new webpack.DllReferencePlugin({
			manifest: path.resolve(Config.paths.appBuildDll, 'vender-manifest.json')
		}),

		new MiniCssExtractPlugin({
			filename: 'assets/css/[name].[hash].css',
			chunkFilename: 'assets/css/[id].[hash].css',
			sourceMap: Config.cssSourceMap
		}),

		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '../../public/index.html'),
			filename: 'index.html',
			alwaysWriteToDisk: true,
			inject: true,
			favicon: Config.paths.faviconPath,
			minify: !Config.isDev ? {
				removeComments: true, // 删除注释
				collapseWhitespace: true, // 折叠空白区域
				removeAttributeQuotes: true, // 尽可能删除属性周围的引号
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
			} : false
		}),

		new AddAssetHtmlPlugin([
			{
				filepath: path.resolve(Config.paths.appBuildDll, 'vender.*.js'),
				includeSourcemap: Config.sourceMap
			}
		]),
		new HtmlWebpackHarddiskPlugin(),

		new webpack.DefinePlugin({
			_$process: {
				env: {
					NODE_ENV: `'${process.env.NODE_ENV || ''}'`
				}
			}
		}),

		new ForkTsCheckerWebpackPlugin({
			// 将async设为false，可以阻止Webpack的emit以等待类型检查器/linter，并向Webpack的编译添加错误。
			async: false
		})

	]

	// 静态文件的Gzip压缩
	Config.isDev && plugins.push(new CompressionWebpackPlugin({
		filename: '[path].gz[query]',
		algorithm: 'gzip',
		/** 默认 .  处理所有匹配此 {RegExp} 的资源*/
		test: new RegExp(
			'\\.(' +
			Config.gzipExtensions.join('|') +
			')$'
		),
		threshold: 10240,
		minRatio: 0.8
	}))

	// webpack 打包分析
	Config.bundleAnalyzerReport && plugins.push(new BundleAnalyzer.BundleAnalyzerPlugin())

	if (Config.isDev) {
		plugins = plugins.concat(hotModulePlugin)
	}

	Config.isDev && plugins.push(new WebpackBar({
		profile: false,
		name: 'client',
		color: 'orange',
		done: states => {
			const hasErrors = Object.values(states).some(state => state.stats.hasErrors())
		}
	}))

	return plugins.concat(Config.isDev ? [] : [
		// 该插件会根据模块的相对路径生成一个四位数的hash作为模块id, 建议用于生产环境。
		new webpack.HashedModuleIdsPlugin(),
		new webpack.optimize.ModuleConcatenationPlugin()
	])
}