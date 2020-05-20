const { NODE_ENV } = process.env
module.exports = require(`./webpack.config.${NODE_ENV}`)