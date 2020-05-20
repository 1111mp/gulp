let config = require(`./webpack.config.dll`)

if (process.env.NODE_MODE === 'dev') {
	config.devtool = 'inline-source-map'
}

module.exports = config
