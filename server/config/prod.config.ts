function getHost() {
  const LOCALE = process.env.LOCALE

  switch (LOCALE) {
    case 'sg':
      return 'service.boltrend.com'
    default:
      return 'bao.163.com'
  }
}

module.exports = {
  ENV: 'prod',

  // 接口转发相关配置
  proxy: {
    protocol: 'https',
    // apiPublicHost: 'npl.bao.163.com', // 公共服务host
    apiPublicHost: 'api.npl.shot.com', // 公共服务host
    apiSysHost: getHost(), // 未聚合的接口host
    apiHost: getHost() // 聚合接口的host
  }
}