// Start the server and send requests.  Only enough to verify that the server really will respond.
const config = require('config')
const rp = require('request-promise-native')

const server = require('./app/server')

server.start()
  .then(() => {
    return rp('http://localhost:3003/public?command=returnTicker')
  })
  .then((html) => {
    console.log('returnTicker: ', html)
    return rp('http://localhost:3003/public?command=return24Volume')
  })
  .then((html) => {
    console.log('return24Volume: ', html)
    return rp('http://localhost:3003/public?command=returnOrderBook&currencyPair=all')
  })
  .then((html) => {
    console.log('returnOrderBook: ', html)
    return rp('http://localhost:3003/public?command=returnTradeHistoryPublic&currencyPair=' + config.get('testData.markets')[0])
  })
  .then((html) => {
    console.log('returnTradeHistoryPublic: ', html)
    return rp('http://localhost:3003/public?command=returnChartData&currencyPair=' + config.get('testData.markets')[0] + '&period=86400&start=0')
  })
  .then((html) => {
    console.log('returnChartData: ', html)
    server.stop()
  })
