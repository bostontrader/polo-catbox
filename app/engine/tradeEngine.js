function Engine () {
  this.brainWipe()
}

Engine.prototype.brainWipe = function () {
  this.deposits = []
  this.loanOffers = []
  this.loanDemands = []
  this.orders2Buy = []
  this.orders2Sell = []
  this.trades = []
  this.desiredTradeDate = undefined
}

// undefinedCandleStick and emptyCandleStick look pretty similar.  But there are some subtle differences that justify their existences.  Any attempt to unify these will probably founder on nettlesome code irritants.  Better to just accept this beautiful diversity.

// Use this to begin collecting the summary info
Engine.prototype.undefinedCandleStick = {
  high: undefined,
  low: undefined,
  open: undefined,
  close: undefined,
  volume: 0,
  quoteVolume: 0,
  weightedAverage: undefined
}

// Use this as the API response.
Engine.prototype.emptyCandleStick = {date: 0, high: 0, low: 0, open: 0, close: 0, volume: 0, quoteVolume: 0, weightedAverage: 0}

// PUBLIC API
// 1.
Engine.prototype.returnTicker =
  function (markets) { return require('./returnTicker/impl')(markets, this.orders2Buy, this.orders2Sell, this.trades) }

// 2.
Engine.prototype.return24Volume = function () { return require('./return24Volume/impl')(this.trades) }

// 3.
Engine.prototype.returnOrderBook = function () { return require('./returnOrderBook/impl')(this.orders2Buy, this.orders2Sell) }

// 4.
Engine.prototype.returnTradeHistory = function (market) { return require('./returnTradeHistory/impl')(market, this.trades) }

// 5.
Engine.prototype.returnChartData = function (market, start, end, period) { return require('./returnChartData/impl')(market, start, end, period, this) }

// 6.
Engine.prototype.returnCurrencies = function () { return require('./returnCurrencies/impl')() }

// 7. returnLoanOrders
Engine.prototype.returnLoanOrders = function () { return {offers: this.loanOffers, demands: this.loanDemands} }

// Trading API
// 8.
Engine.prototype.returnBalances = function (user) { return require('./returnBalances/impl')(user, this.deposits) }

// 9. returnCompleteBalances
// 10. returnDepositAddresses
// 11. generateNewAddress
// 12. returnDepositsWithdrawals
// 13. returnOpenOrders
// 14. returnTradeHistory
// 15. returnOrderTrades

// 16.
Engine.prototype.buy = function (newOrder) {
  const result = require('./buy/impl')(newOrder, this)
  if ('resultingTrades' in result) { this.trades = this.trades.concat(result.resultingTrades) }
  return result
}

// 17.
Engine.prototype.sell = function (newOrder) {
  const result = require('./sell/impl')(newOrder, this)
  if ('resultingTrades' in result) { this.trades = this.trades.concat(result.resultingTrades) }
  return result
}

// 18. cancelOrder
// 19. moveOrder
// 20. withdraw
// 21. returnFeeInfo
// 22. returnAvailableAccountBalances
// 23. returnTradableBalances
// 24. transferBalance
// 25. returnMarginAccountSummary
// 26. marginBuy
// 27. marginSell
// 28. getMarginPosition
// 29. closeMarginPosition

// 30.
Engine.prototype.createLoanOffer = function (user, currency, amount, duration, autoRenew, lendingRate, date) { return require('./createLoanOffer/impl')(user, currency, amount, duration, autoRenew, lendingRate, date, this.loanOffers) }

// 31. cancelLoanOffer

// 32.
Engine.prototype.returnOpenLoanOffers = function (user) { return require('./returnOpenLoanOffers/impl')(user, this.loanOffers) }

// 33. returnActiveLoans
// 34. returnLendingHistory
// 35. toggleAutoRenew

// These methods are not in the Polo API, but they are useful for this engine.
Engine.prototype.makeDeposit = function (user, currency, amount) { return require('./makeDeposit/impl')(user, currency, amount, this.deposits) }

Engine.prototype.returnCandleStick = function (trades) { return require('./returnCandleStick/impl')(trades) }

module.exports = new Engine()
