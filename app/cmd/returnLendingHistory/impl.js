const c = require('../../poloConstants')

module.exports = (req, engine) => {
  // If there are no parameters set, just return an empty []
  if (!('start' in req.body) && !('end' in req.body) && !('limit' in req.body)) return []

  // Set missing parameters to defaults.
  const start = ('start' in req.body) ? parseInt(req.body.start) : 0
  const end = ('end' in req.body) ? parseInt(req.body.end) : 0
  const limit = ('limit' in req.body) ? parseInt(req.body.limit) : 999999 // supposed to mean no limit

  // 1. The parameters must be integers
  if (isNaN(start)) { return {'error': c.returnLendingHistory.INVALID_START_PARAMETER} }
  if (isNaN(end)) { return {'error': c.returnLendingHistory.INVALID_END_PARAMETER} }
  if (isNaN(limit)) { return {'error': c.returnLendingHistory.INVALID_LIMIT_PARAMETER} }

  // 2. Ready for the Engine
  return engine.returnLendingHistory(req.headers.key, start, end)
}
