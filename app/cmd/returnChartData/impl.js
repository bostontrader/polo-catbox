module.exports = (reqQuery, engine) => {
  // Ready for the Engine
  return engine.returnChartData(reqQuery.currencyPair, reqQuery.period, reqQuery.start, reqQuery.end)
}
