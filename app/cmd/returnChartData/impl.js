const config = require('config')
const c = require('../../poloConstants')

module.exports = (reqQuery, engine) => {
  // If there are no parameters set, error
  if (Object.keys(reqQuery).length === 0) return {error: c.returnChartData.PLEASE_SPECIFY_VALID_PERIOD}

  // Look for a valid period
  const period = ('period' in reqQuery) ? parseInt(reqQuery.period) : undefined
  if ([300, 900, 1800, 7200, 14400, 86400].indexOf(period) === -1) { return {error: c.returnChartData.PLEASE_SPECIFY_VALID_PERIOD} }

  // There must be a currencyPair parameter
  if (!('currencyPair' in reqQuery)) return {error: c.returnChartData.PLEASE_SPECIFY_A_CURRENCY_PAIR}

  // The currencyPair must be in the list of valid markets
  if (config.get('testData.markets').indexOf(reqQuery.currencyPair) === -1) return {error: c.returnChartData.INVALID_CURRENCY_PAIR}

  // There must be a start parameter
  if (!('start' in reqQuery)) return {error: c.returnChartData.INVALID_START_TIME}

  // Set missing numeric parameters to defaults.
  const start = parseInt(reqQuery.start)
  const end = ('end' in reqQuery) ? parseInt(reqQuery.end) : 9999999999 // end of time

  // The numeric parameters must be integers
  if (isNaN(start)) { return {error: c.returnChartData.INVALID_START_TIME} }
  if (isNaN(end)) { return {error: c.returnChartData.INVALID_END_TIME} }

  // The numeric parameters must not be negative
  if (start < 0) { return {error: c.returnChartData.INVALID_START_TIME} }
  if (end < 0) { return {error: c.returnChartData.INVALID_END_TIME} }

  // Ready for the Engine
  return engine.returnChartData(reqQuery.currencyPair, period, start, end)
}
