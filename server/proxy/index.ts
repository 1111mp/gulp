
/**
 * proxy middleware
 */

// @ts-ignore
const request = require('./request')

/**
 * 根据分析proxy url的结果和当前的req来分析最终的url/method/头信息
 * @param {Object} req express request
 * @param {Object} res express response
 * @param {Object} path 请求路径
 */
function setRequest(req, res, params) {
	let headers = req.headers || {};
	let method = params.method || req.method;
	let isUrl = /^(http:\/\/|https:\/\/)/;
	let protocol = 'https';

	// 获取实际要请求的method和url
	let url = params.url || req.url;

	if (isUrl.test(url)) {
		protocol = url.split(':')[0];
	} else {
		protocol = params.protocol || req.protocol;
	}

	// 复制一份头信息
	let result = Object.assign({}, headers);

	// 配置host，先把当前用户host存入user-host,然后把请求host赋值给headers
	result['user-host'] = result.host;

	// 配置contentType，可以实现node层发出不同content-type的需求
	result['content-type'] = params.contentType || headers['content-type'];
	// 由于字段参数发生改变，content-length不再可信删除content-length字段
	delete result['content-length'];
	delete result['host'];

	// 干掉请求中的if-modified-since字段，以防命中服务端缓存，返回304
	delete result['if-modified-since'];

	// result['request_id'] = ctx.state && ctx.state.requestId;

	return {
		protocol: protocol,
		method: method,
		url: url,
		headers: result
	};
}

/**
 * 检查cookie的合法性
 * @param  {Array} cookies  cookies字段数组
 * @return {Boolean}        是否合法
 */
function validateCookies(cookies) {
	if (!cookies || !cookies.length || 0 >= cookies.length) {
		return false
	}

	if (!cookies[0]) {
		return false
	}

	return true
}

/**
 * 设置response cookie
 * @param {object} res     response
 * @param {object} headers 头信息
 */
function setResCookies(req, res, headers) {
	if (!headers || !validateCookies(headers['set-cookie'])) {
		return
	}

	let cookies = headers['set-cookie']

	res._headers = res._headers || {}
	res._headerNames = res._headerNames || {}

	// 以下set-cookie的方案参见nodejs源码：https://github.com/nodejs/node/blob/master/lib/_http_outgoing.js#L353-L359
	// 设置头字段中set-cookie为对应cookie
	if (!res._headers['set-cookie']) {
		res._headers['set-cookie'] = cookies
	} else {
		res._headers['set-cookie'] = res._headers['set-cookie'].concat(cookies)
	}

	// 设置头字段set-cookie的名称为set-cookie
	res._headerNames['set-cookie'] = 'set-cookie'
}

module.exports = function (options = {}) {
	function getHandleErr(params) {
		return (
			// @ts-ignore
			(params.conf && params.conf.handleErr) || options.handleErr || handleErr
		);
	}

	// 请求开始
	function before(req, opt) {
		req.tracker && req.tracker.api.begin(opt.uri);
	}

	// 请求结束
	function after(req, opt) {
		req.tracker && req.tracker.api.end(opt.uri);
	}

	function handleErr(req, res, { data, uri, optional }) {
		// 需要判断res，因为可能会是上个handleErr抛出的错误被catch处理，这时候没有res参数
		if (res && res.status !== 200) {
			let info = data ? data.toString() : res;
			req.log &&
				req.log.error &&
				req.log.error(
					res.stack ||
					(data
						? `proxy error: ${uri}`
						: `proxy response status ${res.status}: ${uri
							? uri
							: 'unknown'}`),
					'api'
				);
			if (optional) return;

			return res.status === 'NULL'
				? req.throw(500, info)
				: req.throw(res.status, info);
		}
	}

	return function (req, res, next) {
		if (req.proxy) return next()

		Object.assign(req, {
			// @ts-ignore
			proxy: function (params = {}, host = options.apiServer || '') {
				if (typeof params === 'string') [params, host] = [host, params]

				// @ts-ignore
				let optional = params.optional || false

				let _req = () => {
					let realReq = setRequest(req, res, params)

					let requestOpt = Object.assign(
						{},
						// @ts-ignore
						options.reqConfig,
						{
							uri: `${realReq.protocol}:${host}${realReq.url}`,
							method: realReq.method,
							headers: realReq.headers
						},
						// @ts-ignore
						params.conf
					)

					if (requestOpt.method.toUpperCase() !== 'GET') {
						// @ts-ignore
						requestOpt.body = params.body || req.body || null;
					} else {
						// @ts-ignore
						requestOpt.qs = params.query || req.query || null;
					}

					if (
						requestOpt.headers['content-type'] &&
						requestOpt.headers['content-type'].includes('application/x-www-form-urlencoded')
					) { // form表单提交
						requestOpt.json = false;
						requestOpt.form = requestOpt.body;
						delete requestOpt.body;
					}

					if (
						requestOpt.headers['content-type'] &&
						requestOpt.headers['content-type'].includes('multipart/form-data')
					) {
						delete requestOpt.body;
						delete requestOpt.form;
					}

					return request(
						{
							req: req,
							// @ts-ignore
							needPipeRes: params.needPipeRes || false,
							// @ts-ignore
							before: options.before || before,
							// @ts-ignore
							after: options.after || after
						},
						requestOpt,
						(requestRes, data, uri) => {
							// @ts-ignore
							if (params.needPipeRes) return
							// 设置cookie
							requestRes && setResCookies(req, res, requestRes.headers);
							return { requestRes, data, uri }
						}
					)
				}
				
				return Promise.resolve(
					_req()
						.then(({ requestRes, data, uri }) => {
							getHandleErr(params)(req, res, requestRes, {
								data,
								uri,
								optional
							});
							return data
						})
						.catch((err, uri) => {
							getHandleErr(params)(req, res, err, {
								uri,
								optional
							});
							return err
						})
				)
			}
		})

		return next()
	}
}

