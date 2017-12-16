const config = require('config')
const c = require('../../poloConstants')

module.exports = (key, reqBody, engine) => {
  if (Object.keys(reqBody).length === 0) { return {error: c.sell.TOTAL_MUST_BE_AT_LEAST_0_0001} }

  const currencyPair = ('currencyPair' in reqBody) ? reqBody.currencyPair : undefined
  const rate = ('rate' in reqBody) ? reqBody.rate : 0
  const amount = ('amount' in reqBody) ? reqBody.amount : 0
  const fillOrKill = ('fillOrKill' in reqBody) ? reqBody.fillOrKill : undefined
  const immediateOrCancel = ('immediateOrCancel' in reqBody) ? reqBody.immediateOrCancel : undefined
  const postOnly = ('postOnly' in reqBody) ? reqBody.postOnly : undefined

  if (isNaN(parseFloat(rate))) return {error: c.sell.INVALID_RATE_PARAMETER}
  if (isNaN(parseFloat(amount))) return {error: c.sell.INVALID_AMOUNT_PARAMETER}

  if (rate < 0) return {error: c.sell.INVALID_RATE_PARAMETER}
  if (amount < 0) return {error: c.sell.INVALID_AMOUNT_PARAMETER}

  const total = rate * amount
  if (total < 0.0001) return {error: c.sell.TOTAL_MUST_BE_AT_LEAST_0_0001}

  if (!currencyPair) return {error: c.sell.REQUIRED_PARAMETER_MISSING}

  if (config.get('testData.markets').indexOf(currencyPair) === -1) return {error: c.sell.INVALID_CURRENCY_PAIR_PARAMETER}

  // No more than 1 of the following flags can be set at once
  if (fillOrKill ? 1 : 0 + immediateOrCancel ? 1 : 0 + postOnly ? 1 : 0 > 1) { return {error: c.sell.NO_MORE_THAN_ONE} }

  // Ready for the Engine
  return engine.sell({apiKey: key, currencyPair, rate, amount, fillOrKill, immediateOrCancel, postOnly}, engine)
}
