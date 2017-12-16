const config = require('config')
const c = require('../../poloConstants')

// This is a catbox extra
module.exports = (key, reqBody, engine) => {
  if (!('currency' in reqBody)) { return {error: c.makeDeposit.REQUIRED_PARAMETER_MISSING + ': currency'} }
  const currency = reqBody.currency
  if (!(currency in config.get('testData.currencies'))) return {error: c.makeDeposit.INVALID_CURRENCY}

  // Ready for the Engine
  return engine.makeDeposit(key, currency, reqBody.amount, reqBody.datetime, engine.deposits)
}
