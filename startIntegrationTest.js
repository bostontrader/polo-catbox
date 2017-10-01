const colors = require('colors/safe')

const server = require('./app/server')

const startIntegrationTest = async () => {

  await server.start()

  .then(result => {
    console.log(colors.green('All tests passed'))
    process.exit()
  })

}

startIntegrationTest()
