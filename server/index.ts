const express = require("express")
const webpack = require("webpack")
const { createProxyMiddleware } = require('http-proxy-middleware')
const proxyConfig = require('./proxy.config')
const Config = require('../build/config')
const { createLogger, log } = require('./logger')
const Router = require('./router')
const webpackDevMiddleware = require("webpack-dev-middleware")
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackConfig = require('../build/webpack')

const app = express(),
	PORT = 9090, // 设置启动端口
	complier = webpack(webpackConfig)

app.use(webpackDevMiddleware(complier, {
	// 这里是对 webpackDevMiddleware 的一些配置，具体其他配置我们下面已经列出来了。

	//绑定中间件的公共路径,与webpack配置的路径相同
	publicPath: webpackConfig.output.publicPath,
	quiet: true  //向控制台显示任何内容 
}))

app.use(webpackHotMiddleware(complier, {
	log: false,
	heartbeat: 10000
}))

// 设置访问静态文件的路径
app.use(express.static(Config.paths.appBuildBundle))

app.use(async (req, res, next) => {
	req.log4js = log
	await next()
})

/** 添加日志输出 需要在proxy之前 */
app.use(createLogger())

/** 添加proxy */
Object.keys(proxyConfig).forEach((key) => {
	app.use(key, createProxyMiddleware(proxyConfig[key]))
})
/** 添加proxy */
// app.use(Router())


app.listen(PORT, function () {
	console.log("成功启动：localhost:" + PORT)
})
