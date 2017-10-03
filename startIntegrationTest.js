const colors    = require('colors/safe')
const config    = require('config')
//const deepEqual = require('deep-equal')
const request   = require('request')

const Poloniex = require('./polo-adapter')

const server = require('./app/server')

function deepEqual(obj1,obj2){

  if(obj1 === obj2) {   //Same object reference
    return true; }

  if( Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false; }  // If length is not same objects are not


  for(var i in obj1){
    if((obj1[i] !== null && typeof obj1[i] === 'object') &&
      (obj2[i] !== null && typeof obj2[i] === 'object')){

      return deepEqual(obj1[i],obj2[i]);}

    else if(((typeof obj1[i]) != 'object') &&
      ((typeof obj1[i]) != 'object')){
      if(obj1[i]===obj2[i]){
        return true; // These are identical values!
      }
    }

    else if(obj1[i]==null && obj2[i]==null)
    { return true; }

    else return false; //If they are not equal
  }
}

const startIntegrationTest = async () => {


  try {

    const u = config.get('url')
    const url = u.protocol + "://" + u.host + ":" + u.port + "/tradingApi"
    const keys = config.get('keys')
    const poloniexPrivate = new Poloniex(keys.apiKey, keys.secret, 0, url)

    await server.start()

    const result = await poloniexPrivate.returnDepositsWithdrawals(0,  Date.now())
    if(!deepEqual(result, config.get('testData.returnDepositsWithdrawals')))
      throw new Error('returnDepositsWithdrawals failed its test')

    console.log(colors.green('All tests passed'))
    process.exit()


  } catch(e) {
    console.log(e)
    process.exit()
  }

}

startIntegrationTest()
