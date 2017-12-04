const config = require('config')
const c = require('../../poloConstants')

module.exports = (reqQuery, engine) => {
  if (Object.keys(reqQuery).length === 0) { return {'error': c.TOTAL_MUST_BE_AT_LEAST_0_0001} }

  const currencyPair = ('currencyPair' in reqQuery) ? reqQuery.currencyPair : undefined
  const rate = ('rate' in reqQuery) ? reqQuery.rate : 0
  const amount = ('amount' in reqQuery) ? reqQuery.amount : 0
  const fillOrKill = ('fillOrKill' in reqQuery) ? reqQuery.fillOrKill : undefined
  const immediateOrCancel = ('immediateOrCancel' in reqQuery) ? reqQuery.immediateOrCancel : undefined
  const postOnly = ('postOnly' in reqQuery) ? reqQuery.postOnly : undefined

  if (isNaN(parseFloat(rate))) return {'error': c.INVALID_RATE_PARAMETER}
  if (isNaN(parseFloat(amount))) return {'error': c.INVALID_AMOUNT_PARAMETER}

  if (rate < 0) return {'error': c.INVALID_RATE_PARAMETER}
  if (amount < 0) return {'error': c.INVALID_AMOUNT_PARAMETER}

  const total = rate * amount
  if (total < 0.0001) return {'error': c.TOTAL_MUST_BE_AT_LEAST_0_0001}

  if (!currencyPair) return {'error': c.REQUIRED_PARAMETER_MISSING}

  if (config.get('testData.markets').indexOf(currencyPair) === -1) return {'error': c.INVALID_CURRENCY_PAIR_PARAMETER}

  // No more than 1 of the following flags can be set at once
  if (fillOrKill ? 1 : 0 + immediateOrCancel ? 1 : 0 + postOnly ? 1 : 0 > 1) { return {'error': c.NO_MORE_THAN_ONE} }

  // Ready for the Engine
  return engine.returnTradeHistoryPrivate(reqQuery.currencyPair)
}
