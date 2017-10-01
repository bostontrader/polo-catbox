const config  = require('config')
const restify = require('restify')

const port = config.get('port')

const restifyCore = restify.createServer()

module.exports = server = {
  start: async () => {
    return new Promise( (resolve, reject) => {
      restifyCore.listen(port, () => {
        console.log('Using configuration: %s', config.get('configName'))
        console.log('%s listening at %s', restifyCore.name, restifyCore.url)
        resolve(true)
      })
    })
  }
}
