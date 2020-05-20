'use strict'

const merge = require('lodash/merge')
const path = require('path')
const fs = require('fs')
const paths = require('../paths')
const { NODE_ENV, PLATFORM } = process.env
const envConfig = NODE_ENV ? require(`./${NODE_ENV}.config`) : {}

const uploadCinfig = require(paths.uploadConfig)
const packageJson = require(paths.appPackageJson)
const appName = packageJson.name
const platform = PLATFORM || 'web'
const uploadPath = `${appName}/${NODE_ENV}/${platform}${packageJson.buildVersion ? '/' + packageJson.buildVersion : ''}`
const cleanPath = `/${appName}`

module.exports = merge({}, {

	isDev: process.env.NODE_ENV !== 'prod',

	// 打包规则
	target: PLATFORM || 'web',

	minimize: true,

	// sourcemap
	sourceMap: false,
	cssSourceMap: false,

	gzipExtensions: ['js', 'css'],

	publicPath: NODE_ENV === 'prod' ? `https://${uploadCinfig.ssh.host}:${uploadCinfig.ssh.port}/${uploadPath}` : '/',

	uploadPath,
	cleanPath,

	rootPath: fs.realpathSync(process.cwd()),

	paths
}, envConfig)