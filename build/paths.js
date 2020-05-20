'use strict'

const fs = require('fs')
const path = require('path')

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)

module.exports = {
	appBuildBundle: resolveApp('dist/bundle'),
	appBuildDll: resolveApp('dist/vender'),
	appTsConfig: resolveApp('tsconfig.json'),
	appNodeModules: resolveApp('node_modules'),
	appIndexJs: resolveApp('src/index.tsx'),
	faviconPath: resolveApp('public/favicon.ico'),
	appPackageJson: resolveApp('package.json'),
	appUploadPacker: resolveApp('temp/packer'),
	uploadConfig: resolveApp('upload.config.ts'),

	src: resolveApp('src'),
	appAlias: {
		routes: resolveApp('src/routes'),
		stores: resolveApp('src/stores'),
		pages: resolveApp('src/pages'),
		components: resolveApp('src/components'),
		common: resolveApp('src/common'),
		service: resolveApp('src/common/service'),
		utils: resolveApp('src/common/utils'),
	}
}