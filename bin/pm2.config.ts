var ENV_CONFIG = {
	dev: {
		NODE_ENV: 'dev',
		PORT: '19101'
	},
	qa: {
		NODE_ENV: 'qa',
		PORT: '19101'
	},
	yz: {
		NODE_ENV: 'yz',
		PORT: '19101',
		INSTANCES: 4,
		EXEC_MODE: 'cluster'
	},
	prod: {
		NODE_ENV: 'prod',
		PORT: '19101',
		INSTANCES: 4,
		EXEC_MODE: 'cluster'
	},
	alpha: {
		NODE_ENV: 'alpha',
		PORT: '19101',
		INSTANCES: 4,
		EXEC_MODE: 'cluster'
	}
}

function getAppConfig(DEPLOY_ENV) {
	var envConfig = ENV_CONFIG[DEPLOY_ENV]
	var NODE_ENV = envConfig.NODE_ENV
	var EXEC_MODE = envConfig.EXEC_MODE || 'fork'
	var APP_NAME = 'appName'
	var INSTANCES = envConfig.INSTANCES || 1 // 启动进程数

	return {
		name: APP_NAME,
		script: 'server',
		exec_interpreter: '',
		watch: false,
		env: {
			NODE_ENV: NODE_ENV,
			PORT: envConfig.PORT
		},
		exec_mode: EXEC_MODE,
		instances: INSTANCES,
		out_file: `./logs/pm2/pm2-web.log`,
		error_file: `./logs/pm2/pm2-error.log`,
		merge_logs: true,
		max_memory_restart: '1G'
	}
}

module.exports = { apps: [getAppConfig(process.env.NODE_ENV)] }