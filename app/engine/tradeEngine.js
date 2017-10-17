function Engine () {
  this.orders2Buy = []
  this.orders2Sell = []
  this.trades = []
}

Engine.prototype.returnTicker =
  function () { return require('./returnTicker/returnTicker')(this.orders2Buy, this.orders2Sell, this.trades) }

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
