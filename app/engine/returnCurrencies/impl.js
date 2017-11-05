const config = require('config')

module.exports = () => {
  return config.get('testData.currencies')
}
