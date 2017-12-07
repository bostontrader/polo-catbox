module.exports = (engine) => {
  // This API endpoint does not have any parameters, so there's nothing to do here.  Ready for the Engine.
  return engine.returnTicker(engine.markets, engine.orders2Buy, engine.orders2Sell, engine.trades)
}
