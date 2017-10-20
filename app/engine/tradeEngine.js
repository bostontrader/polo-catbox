function Engine () {
  this.brainWipe()
}

Engine.prototype.brainWipe = function () {
  this.orders2Buy = []
  this.orders2Sell = []
  this.trades = []
}

Engine.prototype.returnTicker =
  function (markets) { return require('./returnTicker/returnTicker')(markets, this.orders2Buy, this.orders2Sell, this.trades) }

Engine.prototype.return24Volume = function () { return require('./return24Volume/return24Volume')(this.trades) }

Engine.prototype.returnOrderBook = function () { return require('./returnOrderBook/returnOrderBook')(this.orders2Buy, this.orders2Sell) }

Engine.prototype.buy = function (newOrder) {
  const result = require('./buy/buy')(newOrder, this.orders2Buy, this.orders2Sell)
  if ('resultingTrades' in result) { this.trades = this.trades.concat(result.resultingTrades) }
  return result
}

Engine.prototype.sell = function (newOrder) {
  const result = require('./sell/sell')(newOrder, this.orders2Buy, this.orders2Sell)
  if ('resultingTrades' in result) { this.trades = this.trades.concat(result.resultingTrades) }
  return result
}

module.exports = new Engine()
