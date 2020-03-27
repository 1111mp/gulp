const { task, src, dest, series } = require('gulp')
const spritesmith = require('gulp.spritesmith')
const mergeStream = require('merge-stream')
const imagemin = require('gulp-imagemin')
const buffer = require('vinyl-buffer')
const clean = require('gulp-clean')

const fs = require('fs')
const path = require('path')

/** 公共图片文件路径 用来构建雪碧图 */
const SPRITES_SRC: string = './src/assets/sprites/sprite-src'
/** 构建生成雪碧图的输出路径 */
const SPRITES_OUTPUT: string = './src/assets/sprites/src'
/** 构建生成雪碧图style文件输出路径 */
const SPRITES_STYLE: string = './src/assets/sprites/styles'
/** 公共组件ui路径 */
const UI_DIR = './src/common/ui'

const tasks: Record<string, () => any> = {
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
	}
}

// @ts-ignore
Reflect.ownKeys(tasks).forEach((taskName: any) => task(taskName, tasks[taskName]))

/** 构建雪碧图 */
task('build:sprite', series('cleanSprites', 'sprite'))

task('build:ui-sprites', series('uiSprites'))
