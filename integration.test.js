// Start the server and send requests.  Only enough to verify that the server really will respond.
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
    server.stop()
  })
