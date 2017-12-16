const c = require('../../poloConstants')

module.exports = (user, reqBody, engine) => {
  // 1. If either parameter is missing, send back this odd result.
  if (!('start' in reqBody) || !('end' in reqBody)) { return {error: c.returnDepositsWithdrawals.INVALID_API_KEY_SECRET_PAIR} }

  // 2. start must be an integer
  const start = parseInt(reqBody.start)
  if (isNaN(start)) { return {error: c.returnDepositsWithdrawals.INVALID_START_PARAMETER} }

  // 3. end must be an integer
  const end = parseInt(reqBody.end)
  if (isNaN(end)) { return {error: c.returnDepositsWithdrawals.INVALID_END_PARAMETER} }

  // 4. Ready for the Engine
  const result = engine.returnDepositsWithdrawals(user, start, end)
  return result
}
