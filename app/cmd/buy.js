const poloConstants = require('../poloConstants')

module.exports = (req) => {

  const currencyPair = ('currencyPair' in req.body) ? req.body.currencyPair : undefined
  const rate         = ('rate'         in req.body) ? req.body.rate : 0
  const amount       = ('amount'       in req.body) ? req.body.amount : 0
  const fillOrKill   = ('fillOrKill' in req.body) ? req.body.fillOrKill : undefined
  const immediateOrCancel = ('immediateOrCancel' in req.body) ? req.body.immediateOrCancel : undefined
  const postOnly     = ('postOnly' in req.body) ? req.body.postOnly : undefined

  if (isNaN(parseFloat(rate)))
    return {"error":poloConstants.INVALID_RATE_PARAMETER}

  if (isNaN(parseFloat(amount)))
    return {"error":poloConstants.INVALID_AMOUNT_PARAMETER}

  const total = rate * amount
  if (total < 0.0001)
    return {"error":poloConstants.TOTAL_MUST_BE_AT_LEAST_0_0001}

  if (!currencyPair)
    return {"error":poloConstants.REQUIRED_PARAMETER_MISSING}

  return 'BUY results'

}
