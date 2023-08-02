// src/framework/services/fetchErrorCatch.js
import { Notification } from 'element-ui'
/**
 * @param { {code: string, message: string} } error 异常信息
 * @param { {args: Array<ApiArg>} } args 接口请求时携带的参数
 */
export default (error, { args }) => {
  // 将错误信息统一显示到右上角
  Notification({
    title: `操作失败（Code = ${error.code}）`,
    type: 'error',
    dangerouslyUseHTMLString: true,
    message: '<pre style="white-space: pre-wrap;word-wrap: break-word;">' + error.message + '</pre>'
  })
  throw error
}
