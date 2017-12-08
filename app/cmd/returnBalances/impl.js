module.exports = (user, engine) => {
  // This API endpoint does not have any parameters, so there's nothing to do here.  Ready for the Engine.
  // The Engine needs many things to compute the balance so send the entire Engine as a parameter.
  return engine.returnBalances(user, engine)
}
