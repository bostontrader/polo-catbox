const config = require('config')

const c = require('./constants')
const engine = require('../tradeEngine')

/*
This module support cases SNB and SNC.  firstTradeTiming, lastTradeTiming, period (s), and quantity come from constants.

There are 25 permutations built into this module.  The exact time of the firstPeriod and lastPeriod are hardwired, but they should be adjusted by fpOffset (s) and lpOffset (s), as computed by the caller.

The diagrams were originally created for SNB.  They don't accurately describe SNC.  I leave it as an exercise for the reader to correct this woeful situation.
 */
module.exports = (firstTradeTiming, lastTradeTiming, period, quantity, fpOffset, lpOffset) => {
  // In order to ensure that all timing created by this function > 0, we can use this timing offset.  Let's start with a timing offset = 10 periods.
  const timingOffset = period * 10
  // const market = config.get('testData.markets')[0]
  const retVal = {}

  const currencyPair = config.get('testData.markets')[0]
  const currencies = currencyPair.split('_')
  const baseCurrency = currencies[0]
  const quoteCurrency = currencies[1]

  // In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', baseCurrency, 1000)
  engine.makeDeposit('others', quoteCurrency, 1000)

  /*
  Given some collection of trades filter on currencyPair and return the candlestick info for the single period (s) that dateTime (s) appears in.  The caller should merely send the dateTime and it's this function's responsibility to determine the actual starting dateTime of the relevant period.

  Datetime in in seconds but the trades record ms.  So beware.
   */
  const getExpectedCandleStick = (dateTime, period, currencyPair, trades) => {
    const fpDateTime = (Math.floor(dateTime / period) * period) * 1000
    const npDateTime = fpDateTime + period * 1000
    // Get the expected candlestick for the single desired period
    const relevantTrades = trades
    // all trades for the desired currencyPair within the given time period
      .filter(trade => (
        trade.baseCurrency + '_' + trade.quoteCurrency === currencyPair) &&
        fpDateTime <= trade.date &&
        trade.date < npDateTime
      )
      // sorted by datetime ASC
      .sort(trade => (a, b) => a.date === b.date ? 0 : a.date > b.date ? 1 : -1)
    const retVal = engine.returnCandleStick(relevantTrades)
    retVal.date = fpDateTime

    return retVal
  }

  const doTest = (engine, ftDateTime, fpDateTime, lpDateTime, ltDateTime, fExpectEmpty) => {
    let rate = 0.015
    for (let i = 0; i < quantity; i++) {
      engine.desiredTradeDate = ftDateTime * 1000
      engine.sell({apiKey: 'others', currencyPair, dt: ftDateTime * 1000, rate, amount: 1})
      engine.buy({apiKey: 'others', currencyPair, dt: ftDateTime * 1000, rate, amount: 1})

      if (ltDateTime) {
        engine.desiredTradeDate = ltDateTime * 1000
        engine.sell({apiKey: 'others', currencyPair, dt: ltDateTime * 1000, rate, amount: 1})
        engine.buy({apiKey: 'others', currencyPair, dt: ltDateTime * 1000, rate, amount: 1})
      }
      rate += 0.001
    }

    let retVal = {}
    retVal.actual = engine.returnChartData(currencyPair, fpDateTime * 1000, lpDateTime * 1000, period * 1000)
    retVal.expected = fExpectEmpty ? [ engine.emptyCandleStick ] : [ getExpectedCandleStick(fpDateTime, period, currencyPair, engine.trades) ]
    return retVal
  }

  /*
   _________
  |         | <- firstTrade, lastTrade
  |         |
  |         |
  |         |
  |_________|
  |         | <- firstPeriod, lastPeriod
  |         |
  |         |
  |         |
  |_________|

   */
  // One candlestick period. The first trade is before the first period and the last trade is before the last period.
  // Because the first and last periods are the same, all trades are therefore in a single period before the single trading period.
  //
  if (firstTradeTiming === c.firstTradeTiming.FT_BEFORE_FP && lastTradeTiming === c.lastTradeTiming.LT_BEFORE_LP) {
    const ftDateTime = -period + timingOffset
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    return doTest(engine, ftDateTime, fpDateTime, lpDateTime, null, true)
  }

  /*
 _________
|         | <- firstTrade
|         |
|         |
|         |
|_________|
|         | <- firstPeriod, lastPeriod, lastTrade
|         |
|         |
|         |
|_________|

 */
  // One candlestick period.  The first trade is before the first period and the last trade is at the start of the last period.
  // There are therefore trades in two periods.
  if (firstTradeTiming === c.firstTradeTiming.FT_BEFORE_FP && lastTradeTiming === c.lastTradeTiming.LT_EQUAL_LP) {
    const ftDateTime = -period + timingOffset
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    const ltDateTime = timingOffset
    return doTest(engine, ftDateTime, fpDateTime, lpDateTime, ltDateTime, false)
  }

  /*
_________
|         | <- firstTrade
|         |
|         |
|         |
|_________|
|         | <- firstPeriod, lastPeriod
|         | <- lastTrade
|         |
|         |
|_________|

*/
  // One candlestick period.  The first trade is before the first period and the last trade is inside the last period.
  // There are therefore trades before the period and in the period.
  if (firstTradeTiming === c.firstTradeTiming.FT_BEFORE_FP && lastTradeTiming === c.lastTradeTiming.LT_WITHIN_LP) {
    const ftDateTime = -period + timingOffset
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    const ltDateTime = timingOffset + 10
    return doTest(engine, ftDateTime, fpDateTime, lpDateTime, ltDateTime, false)
  }

  /*
_________
|         | <- firstTrade
|         |
|         |
|         |
|_________|
|         | <- firstPeriod, lastPeriod
|         |
|         |
|         |
|_________| <- lastTrade

*/
  // One candlestick period.  The first trade is before the first period and the last trade is at the very end of the last period.
  // There are therefore trades before the period and in the period.
  if (firstTradeTiming === c.firstTradeTiming.FT_BEFORE_FP && lastTradeTiming === c.lastTradeTiming.LT_VERY_END_LP) {
    const ftDateTime = -period + timingOffset
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    const ltDateTime = timingOffset + period - 0.001
    return doTest(engine, ftDateTime, fpDateTime, lpDateTime, ltDateTime, false)
  }

  /*
_________
|         | <- firstTrade
|         |
|         |
|         |
|_________|
|         | <- firstPeriod, lastPeriod
|         |
|         |
|         |
|_________|
|         | <- lastTrade
|         |
|         |
|         |
|_________|

*/
  // One candlestick period.  The first trade is before the first period and the last trade after the last period.
  // There are therefore trades in three periods.
  // This is a single-instance special case. Don't bother to factor this out.
  if (firstTradeTiming === c.firstTradeTiming.FT_BEFORE_FP && lastTradeTiming === c.lastTradeTiming.LT_AFTER_LP) {
    const ftDateTime = -period + timingOffset
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    const ltDateTime = timingOffset + period

    let rate = 0.015
    for (let i = 0; i < quantity; i++) {
      engine.desiredTradeDate = ftDateTime * 1000
      engine.sell({apiKey: 'others', currencyPair, dt: ftDateTime * 1000, rate, amount: 1})
      engine.buy({apiKey: 'others', currencyPair, dt: ftDateTime * 1000, rate, amount: 1})

      engine.desiredTradeDate = fpDateTime * 1000
      engine.sell({apiKey: 'others', currencyPair, dt: fpDateTime * 1000, rate, amount: 1})
      engine.buy({apiKey: 'others', currencyPair, dt: fpDateTime * 1000, rate, amount: 1})

      engine.desiredTradeDate = ltDateTime * 1000
      engine.sell({apiKey: 'others', currencyPair, dt: ltDateTime * 1000, rate, amount: 1})
      engine.buy({apiKey: 'others', currencyPair, dt: ltDateTime * 1000, rate, amount: 1})

      rate += 0.001
    }

    retVal.actual = engine.returnChartData(currencyPair, fpDateTime * 1000, lpDateTime * 1000, period * 1000)
    retVal.expected = [ getExpectedCandleStick(fpDateTime, period, currencyPair, engine.trades) ]
    return retVal
  }

  /*
_________
|         | <- lastTrade
|         |
|         |
|         |
|_________|
|         | <- firstPeriod, lastPeriod, firstTrade
|         |
|         |
|         |
|_________|

*/
  // This is equivalent to FT_BEFORE_FP and LT_EQUAL_LP.  Been there, done that.
  if (firstTradeTiming === c.firstTradeTiming.FT_EQUAL_FP && lastTradeTiming === c.lastTradeTiming.LT_BEFORE_LP) {
    return {actual: [], expected: []}
  }

  /*
 _________
|         | <- firstPeriod, lastPeriod, firstTrade, lastTrade
|         |
|         |
|         |
|_________|

*/
  // One candlestick period. The first trade is at the start of the first period and the last trade is at the start of the last period.
  // Because the first and last periods are the same, all trades are therefore at the start of the single trading period.
  if (firstTradeTiming === c.firstTradeTiming.FT_EQUAL_FP && lastTradeTiming === c.lastTradeTiming.LT_EQUAL_LP) {
    const ftDateTime = timingOffset
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    return doTest(engine, ftDateTime, fpDateTime, lpDateTime, null, false)
  }

  /*
_________
|         | <- firstPeriod, lastPeriod, firstTrade
|         | <- lastTrade
|         |
|         |
|_________|

*/
  // One candlestick period. The first trade is at the start of the first period and the last trade is within the last period.
  // Because the first and last trades are within the same period, ignore the last trade.
  // Therefore all trades occur in the single trading period.
  if (firstTradeTiming === c.firstTradeTiming.FT_EQUAL_FP && lastTradeTiming === c.lastTradeTiming.LT_WITHIN_LP) {
    const ftDateTime = timingOffset
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    return doTest(engine, ftDateTime, fpDateTime, lpDateTime, null, false)
  }

  /*
_________
|         | <- firstPeriod, lastPeriod, firstTrade
|         |
|         |
|         |
|_________| <- lastTrade

*/
  // One candlestick period. The first trade is at the start of the first period and the last trade is at the very end of the last period.
  // Because the first and last trades are within the same period, ignore the last trade.
  // Therefore all trades occur in the single trading period.
  if (firstTradeTiming === c.firstTradeTiming.FT_EQUAL_FP && lastTradeTiming === c.lastTradeTiming.LT_VERY_END_LP) {
    const ftDateTime = timingOffset
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    return doTest(engine, ftDateTime, fpDateTime, lpDateTime, null, false)
  }

  /*
  _________
 |         | <- firstPeriod, lastPeriod, firstTrade
 |         |
 |         |
 |         |
 |_________|
 |         | <- lastTrade
 |         |
 |         |
 |         |
 |_________|

 */

  // One candlestick period. The first trade is at the start of the first period and the last trade is after the last period.
  // All trades are therefore in the single trading period and the period after.
  if (firstTradeTiming === c.firstTradeTiming.FT_EQUAL_FP && lastTradeTiming === c.lastTradeTiming.LT_AFTER_LP) {
    const ftDateTime = timingOffset
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    const ltDateTime = timingOffset + period
    return doTest(engine, ftDateTime, fpDateTime, lpDateTime, ltDateTime, false)
  }

  /*
_________
|         | <- lastTrade
|         |
|         |
|         |
|_________|
|         | <- firstPeriod, lastPeriod
|         | <- firstTrade
|         |
|         |
|_________|

*/
  // This is equivalent to FT_BEFORE_FP and LT_WITHIN_LP.  Been there, done that.
  if (firstTradeTiming === c.firstTradeTiming.FT_WITHIN_FP && lastTradeTiming === c.lastTradeTiming.LT_BEFORE_LP) {
    return {actual: [], expected: []}
  }

  /*
 _________
|         | <- firstPeriod, lastPeriod, lastTrade
|         | <- firstTrade
|         |
|         |
|_________|

*/
  // This is equivalent to FT_EQUAL_FP and LT_WITHIN_LP.  Been there, done that.
  if (firstTradeTiming === c.firstTradeTiming.FT_WITHIN_FP && lastTradeTiming === c.lastTradeTiming.LT_EQUAL_LP) {
    return {actual: [], expected: []}
  }

  /*
_________
|         | <- firstPeriod, lastPeriod
|         | <- firstTrade, lastTrade
|         |
|         |
|_________|

*/
  // One candlestick period. The first trade is within the first period and the last trade is within the last period.
  // Because the first and last periods are the same, all trades are therefore in the single trading period.
  // Because the first and last trades are within the same period, ignore the last trade.
  // Therefore all trades occur in the single trading period.
  if (firstTradeTiming === c.firstTradeTiming.FT_WITHIN_FP && lastTradeTiming === c.lastTradeTiming.LT_WITHIN_LP) {
    const ftDateTime = timingOffset + 10
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    return doTest(engine, ftDateTime, fpDateTime, lpDateTime, null, false)
  }

  /*
_________
|         | <- firstPeriod, lastPeriod
|         | <- firstTrade
|         |
|         |
|_________| <- lastTrade

*/
  // One candlestick period. The first trade is within the first period and the last trade is at the very end of the last period.
  // Because the first and last periods are the same, all trades are therefore in the single trading period.
  // Because the first and last trades are within the same period, ignore the last trade.
  // Therefore all trades occur in the single trading period.
  if (firstTradeTiming === c.firstTradeTiming.FT_WITHIN_FP && lastTradeTiming === c.lastTradeTiming.LT_VERY_END_LP) {
    const ftDateTime = timingOffset + 10
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    return doTest(engine, ftDateTime, fpDateTime, lpDateTime, null, false)
  }

  /*
  _________
 |         | <- firstPeriod, lastPeriod
 |         | <- firstTrade
 |         |
 |         |
 |_________|
 |         | <- lastTrade
 |         |
 |         |
 |         |
 |_________|

 */
  // One candlestick period. The first trade is within the first period and the last trade is after the last period.
  // All trades are therefore in the single trading period and the period after.
  if (firstTradeTiming === c.firstTradeTiming.FT_WITHIN_FP && lastTradeTiming === c.lastTradeTiming.LT_AFTER_LP) {
    const ftDateTime = timingOffset + 10
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    const ltDateTime = timingOffset + period
    return doTest(engine, ftDateTime, fpDateTime, lpDateTime, ltDateTime, false)
  }

  /*
  _________
 |         | <- lastTrade
 |         |
 |         |
 |         |
 |_________|
 |         | <- firstPeriod, lastPeriod
 |         |
 |         |
 |         |
 |_________| <- firstTrade

 */
  // This is equivalent to FT_BEFORE_FP and LT_VERY_END_LP.  Been there, done that.
  if (firstTradeTiming === c.firstTradeTiming.FT_VERY_END_FP && lastTradeTiming === c.lastTradeTiming.LT_BEFORE_LP) {
    return {actual: [], expected: []}
  }

  /*
  _________
 |         | <- firstPeriod, lastPeriod, lastTrade
 |         |
 |         |
 |         |
 |_________| <- firstTrade

 */
  // This is equivalent to FT_EQUAL_FP and LT_VERY_END_LP.  Been there, done that.
  if (firstTradeTiming === c.firstTradeTiming.FT_VERY_END_FP && lastTradeTiming === c.lastTradeTiming.LT_EQUAL_LP) {
    return {actual: [], expected: []}
  }

  /*
  _________
 |         | <- firstPeriod, lastPeriod
 |         | <- lastTrade
 |         |
 |         |
 |_________| <- firstTrade

 */
  // This is equivalent to FT_WITHIN_FP and LT_VERY_END_LP.  Been there, done that.
  if (firstTradeTiming === c.firstTradeTiming.FT_VERY_END_FP && lastTradeTiming === c.lastTradeTiming.LT_WITHIN_LP) {
    return {actual: [], expected: []}
  }

  /*
  _________
 |         | <- firstPeriod, lastPeriod
 |         |
 |         |
 |         |
 |_________| <- firstTrade, lastTrade

 */

  // One candlestick period. The first trade is at the very end of the first period and the last trade is at the very end of the last period.
  // Because the first and last periods are the same, all trades are therefore in the single trading period.
  // Because the first and last trades are within the same period, ignore the last trade.
  // Therefore all trades occur in the single trading period.
  if (firstTradeTiming === c.firstTradeTiming.FT_VERY_END_FP && lastTradeTiming === c.lastTradeTiming.LT_VERY_END_LP) {
    const ftDateTime = period + timingOffset - 0.001
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    return doTest(engine, ftDateTime, fpDateTime, lpDateTime, null, false)
  }

  /*
  _________
 |         | <- firstPeriod, lastPeriod
 |         |
 |         |
 |         |
 |_________| <- firstTrade
 |         | <- lastTrade
 |         |
 |         |
 |         |
 |_________|

 */
  // One candlestick period. The first trade is at the very end of the first period and the last trade is after the last period.
  // All trades are therefore in the single trading period and the period after.
  if (firstTradeTiming === c.firstTradeTiming.FT_VERY_END_FP && lastTradeTiming === c.lastTradeTiming.LT_AFTER_LP) {
    const ftDateTime = period + timingOffset - 0.001
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    const ltDateTime = timingOffset + period
    return doTest(engine, ftDateTime, fpDateTime, lpDateTime, ltDateTime, false)
  }

  /*
 _________
 |         | <- lastTrade
 |         |
 |         |
 |         |
 |_________|
 |         | <- firstPeriod, lastPeriod
 |         |
 |         |
 |         |
 |_________|
 |         | <- firstTrade
 |         |
 |         |
 |         |
 |_________|

 */
  // This is equivalent to FT_BEFORE_FP and LT_AFTER_LP.  Been there, done that.
  if (firstTradeTiming === c.firstTradeTiming.FT_AFTER_FP && lastTradeTiming === c.lastTradeTiming.LT_BEFORE_LP) {
    return {actual: [], expected: []}
  }

  /*
  _________
 |         | <- firstPeriod, lastPeriod, lastTrade
 |         |
 |         |
 |         |
 |_________|
 |         | <- firstTrade
 |         |
 |         |
 |         |
 |_________|

 */
  // This is equivalent to FT_EQUAL_FP and LT_AFTER_LP.  Been there, done that.
  if (firstTradeTiming === c.firstTradeTiming.FT_AFTER_FP && lastTradeTiming === c.lastTradeTiming.LT_EQUAL_LP) {
    return {actual: [], expected: []}
  }

  /*
  _________
 |         | <- firstPeriod, lastPeriod
 |         | <- lastTrade
 |         |
 |         |
 |_________|
 |         | <- firstTrade
 |         |
 |         |
 |         |
 |_________|

 */
  // This is equivalent to FT_WITHIN_FP and LT_AFTER_LP.  Been there, done that.
  if (firstTradeTiming === c.firstTradeTiming.FT_AFTER_FP && lastTradeTiming === c.lastTradeTiming.LT_WITHIN_LP) {
    return {actual: [], expected: []}
  }

  /*
  _________
 |         | <- firstPeriod, lastPeriod
 |         |
 |         |
 |         |
 |_________| <- lastTrade
 |         | <- firstTrade
 |         |
 |         |
 |         |
 |_________|

 */
  // This is equivalent to FT_VERY_END_FP and LT_AFTER_LP.  Been there, done that.
  if (firstTradeTiming === c.firstTradeTiming.FT_AFTER_FP && lastTradeTiming === c.lastTradeTiming.LT_VERY_END_LP) {
    return {actual: [], expected: []}
  }

  /*
  _________
 |         | <- firstPeriod, lastPeriod
 |         |
 |         |
 |         |
 |_________|
 |         | <- firstTrade, lastTrade
 |         |
 |         |
 |         |
 |_________|

 */

  // One candlestick period. The first trade is after the first period and the last trade is after the last period.
  // Because the first trade and the last trade are in the same period, ignore the last trade.
  // All trades are therefore after the single trading period
  if (firstTradeTiming === c.firstTradeTiming.FT_AFTER_FP && lastTradeTiming === c.lastTradeTiming.LT_AFTER_LP) {
    const ftDateTime = period + timingOffset
    const fpDateTime = fpOffset + timingOffset
    const lpDateTime = fpDateTime + lpOffset
    const ltDateTime = timingOffset + period
    return doTest(engine, ftDateTime, fpDateTime, lpDateTime, ltDateTime, true)
  }
}
