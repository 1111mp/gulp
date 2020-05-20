'use strict'

const { task, src, dest, series } = require('gulp')
const babel = require('gulp-babel')
const spritesmith = require('gulp.spritesmith')
const mergeStream = require('merge-stream')
const mergeJson = require('gulp-merge-json')
const imagemin = require('gulp-imagemin')
const buffer = require('vinyl-buffer')
const gutil = require('gulp-util')
const clean = require('gulp-clean')
const GulpSSH = require('gulp-ssh')

const fs = require('fs')
const path = require('path')
const { env } = require('process')

// @ts-ignore
const buildConfig = require('./build/config')
const uploadConfig = require('./upload.config')

/** 公共图片文件路径 用来构建雪碧图 */
const SPRITES_SRC: string = './src/assets/sprites/sprite-src'
/** 构建生成雪碧图的输出路径 */
const SPRITES_OUTPUT: string = './src/assets/sprites/src'
/** 构建生成雪碧图style文件输出路径 */
const SPRITES_STYLE: string = './src/assets/sprites/styles'
/** 公共组件ui路径 */
const UI_DIR = './src/common/ui'

const BUILD_VERSION = getHashVersion(6)

/** 需要上传到服务器的路径 随便取的 按照具体需求 */
const TEMP_DIR = './temp' // 指定部署目录
const DIST_DIR = './dist'

const gulpSSH = new GulpSSH({
	ignoreErrors: false,
	sshConfig: uploadConfig.ssh,
})

function string_src(filename, string) {
	var src = require('stream').Readable({ objectMode: true })
	src._read = function () {
		this.push(new gutil.File({
			cwd: "",
			base: "",
			path: filename,
			contents: new Buffer(string)
		}))
		this.push(null)
	}
	return src
}

function getHashVersion(byte) {
	const crypto = require('crypto');
	const dayjs = require('dayjs');
	const Sha1 = crypto.createHash('sha1');

	Sha1.update(dayjs().format('YYYYMM'));

	const hexStr = Sha1.digest('hex');

	return hexStr.substr(0, byte || hexStr.length);
}

const tasks: Record<string, () => any> = {
	clean: function () {
		return src(TEMP_DIR, { allowEmpty: true })
			.pipe(clean({ force: true }))
	},
	resetPackageJson: function () {
		return mergeStream(
			src(['./package.json'])
				.pipe(
					mergeJson(
						Object.assign({ fileName: 'package.json' }, {
							jsonReplacer: function (key, value) {
								if (/^(?:platform|buildVersion)$/i.test(key)) {
									/** 清除platform和buildVersion */
									return undefined
								} else {
									return value
								}
							}
						})
					)
				)
				.pipe(dest('./'))
		)
	},
	setPackageJson: function () {
		const map = {
			scripts: {
				run: 'NODE_ENV=prod node server'
			},
			version: env.VERSION,
			dependencies: {},
			devDependencies: {},
			build: {},
			jest: {}
		}

		const mergeParams = {
			fileName: 'package.json',
			endObj: {
				platform: env.PLATFORM,
				buildVersion: BUILD_VERSION
			}
		}

		const addVersion = src(['./package.json'])
			.pipe(mergeJson(mergeParams))
			.pipe(dest('./'))

		const mergeVersion = src(['./package.json'])
			.pipe(mergeJson(Object.assign(
				mergeParams,
				{
					jsonReplacer: function (key, value) {
						return map[key] || value
					}
				}
			))).pipe(dest(TEMP_DIR))

		return mergeStream(addVersion, mergeVersion)
	},
	/** 构建项目公共部分图片的雪碧图 以该目录下的文件为单位构建 */
	sprite: function () {
		const dirs = [['', 'main']]

		/** 如果路径存在，则返回 true，否则返回 false */
		if (!fs.existsSync(SPRITES_SRC)) return

		let files = fs.readdirSync(SPRITES_SRC)
		console.log(files)
		files.forEach((file: any) => {
			if (fs.statSync(`${SPRITES_SRC}/${file}`).isDirectory()) dirs.push([file, file])
		})

		return mergeStream(...dirs.map(([dir, name]) => {
			const imgDir = path.resolve(SPRITES_SRC, dir)
			const spriteData = src(`${imgDir}/*.png`)
				.pipe(spritesmith({
					padding: 4,
					imgName: `sprite_${name}.png`,
					imgPath: `@assets/sprites/src/sprite_${name}.png`,
					cssName: `sprite_${name}.styl`,
					cssTemplate: path.resolve(__dirname, 'sprite.handlebars'),
					cssVarMap: function (sprite: any) {
						sprite.name = (name === 'main' ? '' : name + '-') + sprite.name
					}
				}))

			const imgStream = spriteData.img
				.pipe(buffer())
				.pipe(imagemin())
				.pipe(dest(SPRITES_OUTPUT))
			const cssStream = spriteData.css
				.pipe(dest(SPRITES_STYLE))

			return mergeStream(imgStream, cssStream)
		}))

	},
	cleanSprites: function () {
		return src([SPRITES_OUTPUT, SPRITES_STYLE])
			.pipe(clean({ force: true }))
	},
	/** 多个目录下存在需要构建雪碧图 多个入口 */
	uiSprites: function () {
		let dirs: any[] = []
		let uiDirs = fs.readdirSync(UI_DIR)

		/** 遍历ui库下所有的组件 单独构建每个组件下的雪碧图 */
		uiDirs.forEach((file: any) => {
			/** 判断路径是否有效 不是文件夹则return */
			if (!fs.statSync(`${UI_DIR}/${file}`).isDirectory) return

			try {
				/** 雪碧图资源路径（用于构建雪碧图的图片和构建之后的图片和style都在此目录下） */
				let baseDir = `${UI_DIR}/${file}/sprites`
				/** 用于构建雪碧图的图片路径 */
				let srcDir = `${baseDir}/sprites-src`
				/** 多个图片目录 分别构建 */
				let srcFile = fs.readdirSync(srcDir)

				let srcFileArr = [
					{
						ui: file,	// 组件目录名 如./src/common/ui下Button组件的目录名Button
						sprites: baseDir, // 组件目录下的sprites目录 如./src/common/ui/Button/sprites
						source: srcDir, // ./src/common/ui/Button/sprites/sprites-src
						file: ['', 'main'] // 直接存放在./src/common/ui/Button/sprites/sprites-src目录下的图片 放进main模块构建雪碧图 其他以存在的目录构建
					}
				]

				/** 放在./src/common/ui/Button/sprites/sprites-src/folder/*.png 下的各个目录中的图片 以其存在的目录为单位构建 */
				srcFile.forEach((fileName: any) => {
					fs.statSync(`${srcDir}/${fileName}`).isDirectory() && srcFileArr.push({
						ui: file,
						sprites: baseDir,
						source: srcDir,
						file: [fileName, fileName]
					})
				})

				dirs.push(srcFileArr)
			} catch (error) { }
		})

		/** 存放所有的输出流 */
		let streams: any[] = []
		dirs.forEach((srcFileArr: any[]) => {
			srcFileArr.map(({ ui, sprites, source, file }) => {
				const [dir, name] = file // folder或者''
				const sourceDir = path.resolve(source, dir) // ./src/common/ui/Button/sprites/sprites-src/folder || ./src/common/ui/Button/sprites/sprites-src/
				const spriteData = src(`${sourceDir}/*.png`)
					.pipe(spritesmith({
						padding: 4,
						imgName: `sprite_${name}.png`,
						imgPath: `@/common/ui/sprites/src/sprite_${name}.png`,
						cssName: `sprite_${name}.styl`,
						cssTemplate: path.resolve(__dirname, 'sprite.handlebars'),
						cssVarMap: function (sprite: any) {
							sprite.name = (name === 'main' ? '' : name + '-') + sprite.name
						}
					}))
				const imgOutput = path.resolve(sprites, 'src') // 构建之后的雪碧图存放路径 如./src/common/ui/Button/sprites/src
				const styleOutput = path.resolve(sprites, 'styles') // 构建之后的雪碧图style存放路径 如./src/common/ui/Button/sprites/styles
				/** 输出之前先清空之前构建的雪碧图和styles */
				const cleanTask = src([imgOutput, styleOutput])
					.pipe(clean({ force: true }))
				const imgStream = spriteData.img
					.pipe(buffer())
					.pipe(imagemin())
					.pipe(dest(imgOutput))
				const cssStream = spriteData.css
					.pipe(dest(styleOutput))

				streams.push(mergeStream(cleanTask, imgStream, cssStream))
			})
		})

		return mergeStream(...streams)
	},
	/** 上传前先删除服务器上现有文件... */
	exec: function () {
		console.log('删除服务器上现有文件...')

		return gulpSSH.exec(uploadConfig.commands, { filePath: 'commands.log' })
			.pipe(dest('logs'))
	},
	babel: function () {
		return src('server/**')
			.pipe(babel({
				ignore: [/\.ejs/]
			}))
			.on('error', function (err) {
				console.log(err)
				process.exit(-1)
			})
			.pipe(dest(TEMP_DIR + '/server'))
	},
	copyGlobalConfig: function () {
		return src('./bin/**')
			.pipe(dest(TEMP_DIR + '/bin'))
	},
	/** 上传pm2配置文件 如果使用pm2管理node线上服务 */
	putPM2Config: function () {
		let config = require('./bin/pm2.config.ts')

		return string_src("pm2.config.json", JSON.stringify(config))
			.pipe(dest(buildConfig.paths.appUploadPacker))
	},
	/** 创建上传路径 */
	assetsPacker: function () {
		const srcPath = buildConfig.paths.appUploadPacker + `/${buildConfig.uploadPath}`

		return src(buildConfig.paths.appBuildBundle + '/**/*.*')
			.pipe(dest(srcPath))
	},
	/** 文件上传 */
	uploadFile: function () {

		return src(buildConfig.paths.appUploadPacker + '/**')
			.pipe(gulpSSH.dest('/')) // 写入到服务器指定的目录
	},
	/** 清理上传目录 */
	clearPacker: function () {
		return src(buildConfig.paths.appUploadPacker)
			.pipe(clean({ force: true }))
	}
}

// @ts-ignore
Reflect.ownKeys(tasks).forEach((taskName: any) => task(taskName, tasks[taskName]))

/** 构建雪碧图 */
task('build:sprite', series('cleanSprites', 'sprite', function (cb) {
	cb()
}))

task('build:ui-sprites', series('uiSprites', function (cb) {
	cb()
}))

/** 上传静态文件 */
task('uploadAssets', series('assetsPacker', 'uploadFile', 'clearPacker', function (cb) {
	cb()
	// 销毁上传进程
	process.exit()
}))

task('setVersion', series('resetPackageJson', 'setPackageJson', function (cb) {
	cb()
}))

task('babel', series('clean', 'babel', function (cb) {
	cb()
}))

task('build', series('clean', 'setPackageJson', 'babel', 'putPM2Config', 'copyGlobalConfig', 'uploadAssets', 'resetPackageJson', function (cb) {
	cb()
}))
