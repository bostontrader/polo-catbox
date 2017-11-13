const config = require('config')

const poloConstants = require('../poloConstants')

module.exports = (req, orders, tickers) => {

  const currencyPair = ('currencyPair' in req.body) ? req.body.currencyPair : undefined
  const rate         = ('rate'         in req.body) ? req.body.rate : 0
  const amount       = ('amount'       in req.body) ? req.body.amount : 0
  const fillOrKill   = ('fillOrKill' in req.body) ? req.body.fillOrKill : undefined
  const immediateOrCancel = ('immediateOrCancel' in req.body) ? req.body.immediateOrCancel : undefined
  const postOnly     = ('postOnly' in req.body) ? req.body.postOnly : undefined

  if (isNaN(parseFloat(rate)))   return {"error":poloConstants.INVALID_RATE_PARAMETER}
  if (isNaN(parseFloat(amount))) return {"error":poloConstants.INVALID_AMOUNT_PARAMETER}

  if (rate   < 0) return {"error":poloConstants.INVALID_RATE_PARAMETER}
  if (amount < 0) return {"error":poloConstants.INVALID_AMOUNT_PARAMETER}

  const total = rate * amount
  if (total < 0.0001) return {"error":poloConstants.TOTAL_MUST_BE_AT_LEAST_0_0001}

  if (!currencyPair) return {"error":poloConstants.REQUIRED_PARAMETER_MISSING}

  if (!(currencyPair in config.testData.markets)) return {"error":poloConstants.INVALID_CURRENCY_PAIR_PARAMETER}

  // Do we have enough money to make this purchase?
  const purchasingCurrency = currencyPair.split('_')[0]
  const balance = (purchasingCurrency in config.testData.balances) ? config.testData.balances[purchasingCurrency] : 0
  if (total > balance)
    return {"error":poloConstants.NOT_ENOUGH + " " + purchasingCurrency + "."}
  // tweak this to exclude encumbered balances

  // No more than 1 of the following flags can be set at once
  if (fillOrKill ? 1 : 0 + immediateOrCancel ? 1 : 0 + postOnly ? 1 : 0 > 1)
    return {"error":poloConstants.NO_MORE_THAN_ONE}

  if (fillOrKill) {
    // Can I fill it?
    // if yes, fill it
    // else cancel
  }


  //tickers[currencyPair] = {"id":"n/a"}
  orders.push({"new":"buy order"})
  return 'nonsense buy results'

}
