function Engine () {
  this.brainWipe()
}

Engine.prototype.brainWipe = function () {
  this.orders2Buy = []
  this.orders2Sell = []
  this.trades = []
  this.desiredTradeDate = undefined
}

Engine.prototype.returnTicker =
  function (markets) { return require('./returnTicker/returnTicker')(markets, this.orders2Buy, this.orders2Sell, this.trades) }

Engine.prototype.return24Volume = function () { return require('./return24Volume/return24Volume')(this.trades) }

Engine.prototype.returnOrderBook = function () { return require('./returnOrderBook/returnOrderBook')(this.orders2Buy, this.orders2Sell) }

Engine.prototype.returnTradeHistory = function (market) { return require('./returnTradeHistory/returnTradeHistory')(market, this.trades) }

Engine.prototype.returnChartData = function (market, start, end, period) { return require('./returnChartData/returnChartData')(market, start, end, period, this) }

Engine.prototype.buy = function (newOrder) {
  const result = require('./buy/buy')(newOrder, this)
  if ('resultingTrades' in result) { this.trades = this.trades.concat(result.resultingTrades) }
  return result
}

Engine.prototype.sell = function (newOrder) {
  const result = require('./sell/sell')(newOrder, this)
  if ('resultingTrades' in result) { this.trades = this.trades.concat(result.resultingTrades) }
  return result
}

module.exports = new Engine()
