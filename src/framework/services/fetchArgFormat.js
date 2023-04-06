export default args => {
  const { url } = args[0] || { url: '' }
  if (url.indexOf('api') === 0) {
    args[0].url = url.replace('api', process.env.VUE_APP_PROJECT_CODE)
  }
  return args
}
