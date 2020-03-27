
const { override, addWebpackAlias, removeModuleScopePlugin } = require('customize-cra');
const rewireStyl = require("react-app-rewire-stylus-modules");
const path = require('path');

const addStylus = () => (config, env) => {
	config = rewireStyl(config, env)

	return config
}

module.exports = override(
	removeModuleScopePlugin(),
	addWebpackAlias({
		"@": path.resolve(__dirname, "./src")
	}),
	addStylus()
)