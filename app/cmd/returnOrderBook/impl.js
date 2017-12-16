const config = require('config')
const c = require('../../poloConstants')

module.exports = (reqQuery, engine) => {
  // 1. Must have a currencyPair parameter
  if (!('currencyPair' in reqQuery)) { return {error: c.returnOrderBook.PLEASE_SPECIFY_A_CURRENCY_PAIR} }

  const currencyPair = reqQuery.currencyPair

  // 2. The currencyPair must be in the list of valid markets _or_ 'all'
  if (config.get('testData.markets').indexOf(currencyPair) === -1 && currencyPair !== 'all') return {error: c.returnOrderBook.INVALID_CURRENCY_PAIR}

  // 3. If depth is present it should be parseable to an integer.  If not, then set a default.
  let depth
  if ('depth' in reqQuery) {
    depth = parseInt(reqQuery.depth)
    if (isNaN(depth)) { return {error: c.INVALID_DEPTH} }
  } else {
    depth = c.returnOrderBook.defaultDepth
  }

  // Ready for the Engine
  return engine.returnOrderBook(currencyPair, depth)
}
