const poloConstants = require('../poloConstants')

function Engine() {
  this.orders2Buy  = []
  this.orders2Sell = []
  //this.trades      = []
}

Engine.prototype.buy  = function(newOrder) {return require('./buy/buy')  (newOrder, this.orders2Buy, this.orders2Sell)}
Engine.prototype.sell = function(newOrder) {return require('./sell/sell')(newOrder, this.orders2Buy, this.orders2Sell)}

module.exports = new Engine()
