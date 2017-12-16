const config = require('config')
const c = require('../../poloConstants')

module.exports = (reqQuery, engine) => {
  // If there are no parameters set, error
  if (Object.keys(reqQuery).length === 0) return {error: c.returnTradeHistoryPublic.PLEASE_SPECIFY_A_CURRENCY_PAIR}

  // The currencyPair must be in the list of valid markets
  if (config.get('testData.markets').indexOf(reqQuery.currencyPair) === -1) return {error: c.returnTradeHistoryPublic.INVALID_CURRENCY_PAIR}

  // Set missing numeric parameters to defaults.
  const start = ('start' in reqQuery) ? parseInt(reqQuery.start) : 0
  const end = ('end' in reqQuery) ? parseInt(reqQuery.end) : 0

  // The numeric parameters must be integers
  if (isNaN(start)) { return {error: c.returnTradeHistoryPublic.INVALID_START_TIME} }
  if (isNaN(end)) { return {error: c.returnTradeHistoryPublic.INVALID_END_TIME} }

  // The numeric parameters must not be negative
  if (start < 0) { return {error: c.returnTradeHistoryPublic.INVALID_START_TIME} }
  if (end < 0) { return {error: c.returnTradeHistoryPublic.INVALID_END_TIME} }

  // Ready for the Engine
  return engine.returnTradeHistoryPublic(reqQuery.currencyPair, start, end)
}
