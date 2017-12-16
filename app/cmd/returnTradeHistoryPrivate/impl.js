const c = require('../../poloConstants')

module.exports = (req, engine) => {
  // If there are no parameters set, just return an empty []
  if (Object.keys(req.body).length === 0) return []

  // If there is no currencyPair parameters, error
  if (!('currencyPair' in req.body)) { return {error: c.returnTradeHistoryPrivate.REQUIRED_PARAMETER_MISSING} }

  // Set missing numeric parameters to defaults.
  const start = ('start' in req.body) ? parseInt(req.body.start) : 0
  const end = ('end' in req.body) ? parseInt(req.body.end) : 0
  const limit = ('limit' in req.body) ? parseInt(req.body.limit) : 9999999 // supposed to mean no limit

  // 1. The parameters must be integers
  if (isNaN(start)) { return {error: c.returnTradeHistoryPrivate.INVALID_START_PARAMETER} }
  if (isNaN(end)) { return {error: c.returnTradeHistoryPrivate.INVALID_END_PARAMETER} }
  if (isNaN(limit)) { return {error: c.returnTradeHistoryPrivate.INVALID_LIMIT_PARAMETER} }

  // 2. Ready for the Engine
  return engine.returnTradeHistoryPrivate(req.headers.key, req.body.currencyPair, start, end, limit)
}
