const path = require('path')
const { defineConfig } = require('@vue/cli-service')

const BACKEND = process.env.BACKEND || '172.20.151.197:9080'
const HOST = process.env.HOST || '0.0.0.0'
const PORT = process.env.PORT || '8686'
const isPord = process.env.NODE_ENV === 'production'

const apiPrefix = process.env.VUE_APP_API_PREFIX
const baseUrl = isPord ? `/${apiPrefix}/proactive_service` : '/' // `/${packageName}/`

console.log(`project “${process.env.VUE_APP_PROJECT_NAME}” now start`)
console.log('project id:', process.env.VUE_APP_PROJECT_ID)
console.log('project code:', process.env.VUE_APP_PROJECT_CODE)
console.log('BACKEND: ', BACKEND)
console.log('baseUrl: ', baseUrl)
console.log('apiPrefix', apiPrefix)

module.exports = defineConfig({
  transpileDependencies: [
    '@cseed/ui-lowcode-engine',
    '@cseed/ui-menu-designer'
  ],
  publicPath: baseUrl,
  devServer: {
    host: HOST,
    port: PORT,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    proxy: {
      [`/${apiPrefix}`]: {
        target: 'http://' + BACKEND,
        pathRewrite: { [`^/${apiPrefix}`]: '/' }
      },
      '/res-proxy': {
        target: 'http://' + BACKEND,
        // router: 用于替代target 重写目标服务器; 格式同target: protocol+host(+port)
        router: function (req) { return req.query.url.slice(0, (req.query.url.indexOf('/', 10) + 1)) },
        // pathRewrite: 重写请求地址
        pathRewrite: function (path, req) { return req.query.url }
      }
    },
    historyApiFallback: true
  },
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = process.env.VUE_APP_PROJECT_NAME
      return args
    })
  },
  pluginOptions: {
    cseedFrame: {
      frame: '@ccprivate/framework-saas-mirco',
      temp: path.resolve('./.temp')
      // useModuleFederation: true, // 如果开启了模块联邦，则会默认把 src/framework/components.exposes 目录下的组件全部 expose 出去
      // moduleFederationRemotes: {
      //   sunflower: 'cmf_sunflower@http://127.0.0.1:8686/remoteEntry.js' // 使用模块联邦
      // }
    }
  }
})
