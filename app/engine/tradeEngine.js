const config = require('config')

function Engine () {
  this.brainWipe()
}

Engine.prototype.brainWipe = function () {
  this.deposits = []
  this.loanOffers = []
  this.loanDemands = []
  this.markets = config.get('testData.markets')
  this.orders2Buy = []
  this.orders2Sell = []
  this.trades = []
  this.withdrawals = []

  // For testing, we need to be able to compare what we expect to what we get.  Certain things such as API assigned dates and transaction numbers cannot be known in advance, unless we play some trickery.  Here we can set various values as we expect them to be, beforehand, and the trade engine will use these values.
  this.desiredTradeDate = undefined
  this.desiredOrderBookSeq = undefined
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
  function () { return require('./returnTicker/impl')(this.markets, this.orders2Buy, this.orders2Sell, this.trades) }

// 2.
Engine.prototype.return24Volume = function () { return require('./return24Volume/impl')(this.trades) }

// 3.
Engine.prototype.returnOrderBook = function (currencyPair, depth) { return require('./returnOrderBook/impl')(currencyPair, depth, this.orders2Buy, this.orders2Sell, this.desiredOrderBookSeq) }

// 4. The public and private API have the identically named methods, which are conceptually simple, but substantially different.  Thus we really want two methods in the Engine.  See #14.
Engine.prototype.returnTradeHistoryPublic = function (currencyPair, start, end) { return require('./returnTradeHistoryPublic/impl')(currencyPair, start, end, this.trades) }

// 5.
Engine.prototype.returnChartData = function (market, start, end, period) { return require('./returnChartData/impl')(market, start, end, period, this) }

// 6.
Engine.prototype.returnCurrencies = function () { return require('./returnCurrencies/impl')() }

// 7. returnLoanOrders
Engine.prototype.returnLoanOrders = function () { return require('./returnLoanOrders/impl')(this.loanOffers, this.loanDemands) }

// Trading API
// 1.
Engine.prototype.returnBalances = function (user) { return require('./returnBalances/impl')(user, this.deposits, this.withdrawals) }

// 2. returnCompleteBalances
Engine.prototype.returnCompleteBalances = function (user) { return require('./returnCompleteBalances/impl')(user) }

// 3. returnDepositAddresses
Engine.prototype.returnDepositAddresses = function (user) { return require('./returnDepositAddresses/impl')(user) }

// 4. generateNewAddress
Engine.prototype.generateNewAddress = function (user) { return require('./generateNewAddress/impl')(user) }

// 5. returnDepositsWithdrawals
Engine.prototype.returnDepositsWithdrawals = function (user, start, end) { return require('./returnDepositsWithdrawals/impl')(user, start, end, this.deposits, this.withdrawals) }

// 6. returnOpenOrders
Engine.prototype.returnOpenOrders = function (user) { return require('./returnOpenOrders/impl')(user) }

// 7. The public and private API have the identically named methods, which are conceptually simple, but substantially different.  Thus we really want two methods in the Engine.  See #4.
Engine.prototype.returnTradeHistoryPrivate = function (user, currencyPair, start, end, limit) { return require('./returnTradeHistoryPrivate/impl')(user, currencyPair, start, end, limit, this.trades) }

// 8. returnOrderTrades
Engine.prototype.returnOrderTrades = function (user) { return require('./returnOrderTrades/impl')(user) }

// 9.
Engine.prototype.buy = function (buyOrder) {
  const result = require('./buy/impl')(buyOrder, this)
  if ('resultingTrades' in result) { this.trades = this.trades.concat(result.resultingTrades) }
  return result
}

// 10.
Engine.prototype.sell = function (sellOrder) {
  const result = require('./sell/impl')(sellOrder, this)
  if ('resultingTrades' in result) { this.trades = this.trades.concat(result.resultingTrades) }
  return result
}

// 11. cancelOrder
Engine.prototype.cancelOrder = function (user, orderNumber) { return require('./cancelOrder/impl')(user, orderNumber, this.orders2Buy, this.orders2Sell) }

// 12. moveOrder
Engine.prototype.moveOrder = function (user) { return require('./moveOrder/impl')(user) }

// 13. withdraw
Engine.prototype.withdraw = function (user, currency, amount, address, datetime) { return require('./withdraw/impl')(user, currency, amount, address, datetime, this.withdrawals) }

// 14. returnFeeInfo
Engine.prototype.returnFeeInfo = function (user) { return require('./returnFeeInfo/impl')(user) }

// 15. returnAvailableAccountBalances
Engine.prototype.returnAvailableAccountBalances = function (user) { return require('./returnAvailableAccountBalances/impl')(user) }

// 16. returnTradableBalances
Engine.prototype.returnTradableBalances = function (user) { return require('./returnTradableBalances/impl')(user) }

// 17. transferBalance
Engine.prototype.transferBalance = function (user) { return require('./transferBalance/impl')(user) }

// 18. returnMarginAccountSummary
Engine.prototype.returnMarginAccountSummary = function (user) { return require('./returnMarginAccountSummary/impl')(user) }

// 19. marginBuy
Engine.prototype.marginBuy = function (user) { return require('./marginBuy/impl')(user) }

// 20. marginSell
Engine.prototype.marginSell = function (user) { return require('./marginSell/impl')(user) }

// 21. getMarginPosition
Engine.prototype.getMarginPosition = function (user) { return require('./getMarginPosition/impl')(user) }

// 22. closeMarginPosition
Engine.prototype.closeMarginPosition = function (user) { return require('./closeMarginPosition/impl')(user) }

// 23.
Engine.prototype.createLoanOffer = function (user, currency, amount, duration, autoRenew, lendingRate, date, orderID) { return require('./createLoanOffer/impl')(user, currency, amount, duration, autoRenew, lendingRate, date, orderID, this.loanOffers) }

// 24. cancelLoanOffer
Engine.prototype.cancelLoanOffer = function (user, orderNumber) { return require('./cancelLoanOffer/impl')(user, orderNumber, this.loanOffers) }

// 25.
Engine.prototype.returnOpenLoanOffers = function (user) { return require('./returnOpenLoanOffers/impl')(user, this.loanOffers) }

// 26. returnActiveLoans
Engine.prototype.returnActiveLoans = function (user) { return require('./returnActiveLoans/impl')(user) }

// 27. returnLendingHistory
Engine.prototype.returnLendingHistory = function (user, start, end, limit) { return require('./returnLendingHistory/impl')(user, start, end, limit, this.loanOffers) }

// 28. toggleAutoRenew
Engine.prototype.toggleAutoRenew = function () { return {'success': 1, 'message': 0} }

// These methods are not in the Polo API, but they are useful for this engine.
Engine.prototype.acceptLoan = function (borrower, loanID, startDate) { return require('./acceptLoan/impl')(borrower, loanID, startDate, this.loanOffers) }

Engine.prototype.makeDeposit = function (user, currency, amount, datetime) { return require('./makeDeposit/impl')(user, currency, amount, datetime, this.deposits) }

Engine.prototype.repayLoan = function (loanID, endDate) { return require('./repayLoan/impl')(loanID, endDate, this.loanOffers) }

Engine.prototype.returnCandleStick = function (trades) { return require('./returnCandleStick/impl')(trades) }

module.exports = new Engine()
