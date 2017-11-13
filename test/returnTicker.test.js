const config    = require('config')
const deepEqual = require('deep-equal')

// There are no input parameters for this endpoint.  EZ.
module.exports = async (poloAdapter) => {


  const theTest = async (announcement, expectedResults) => {
    console.log(announcement)
    const actual   = await poloAdapter.returnTicker()

    Object.keys(actual).forEach((k,v)=>{
      console.log(13, k,actual[k])
      const ticker = actual[k]
      //const idMatch = ('id' in actual) // we only care that the key exists, don't care to match
      //const lastMatch = (actual.lastMatch === expectedResults.lastMatch)
      //const lowestAskMatch = (actual.lowestAskMatch === expectedResults.lowestAskMatch)
      //const highestBidMatch = (actual.highestBidMatch === expectedResults.highestBidMatch)
      //const percentChangeMatch = (actual.percentChangeMatch === expectedResults.percentChangeMatch)
      //const baseVolumeMatch = (actual.baseVolumeMatch === expectedResults.baseVolumeMatch)
      //const quoteVolumeMatch = (actual.quoteVolumeMatch === expectedResults.quoteVolumeMatch)
      //const isFrozenMatchMatch = (actual.isFrozenMatchMatch === expectedResults.isFrozenMatchMatch)
      //const high24hrMatch = (actual.high24hrMatch === expectedResults.high24hrMatch)
      //const low24hrMatch = (actual.low24hrMatch === expectedResults.low24hrMatch)

      if(!('id' in ticker))
        return Promise.reject('returnTicker failed its test.  Missing id key. Ticker:'+JSON.stringify(ticker))

    //if(!deepEqual(actual, expectedResults))
      //return Promise.reject('returnTicker failed its test. Expected:'+JSON.stringify(expectedResults)+' Actual:'+JSON.stringify(actual))
    })
  }

  // 1. Starting with an empty server with no trades.  Guess at a likely result.
  await theTest('testing returnTicker with zero entries', {})

  // 2. Setup an order to buy and then an order to sell.
  await poloAdapter.buy({currencyPair:'BTC_LTC', rate:0.002,amount:0.05})
  await poloAdapter.sell({currencyPair:'BTC_LTC', rate:0.002,amount:0.02})

  // 2.1 What does percentChange mean?  From the last transaction?  What does it mean if there's only
  // one transaction?  We have to guess.
  await theTest('testing returnTicker with the first entry', {"id":7,"last":"0.00000029","lowestAsk":"0.00000029","highestBid":"0.00000028","percentChange":"0.00000000","baseVolume":"24.82913919","quoteVolume":"85012366.95362642","isFrozen":"0","high24hr":"0.00000030","low24hr":"0.00000028"})

  // 3. Make another transaction for the original currencyPair.
  // 4. Make another transaction for a 2nd currencyPair.

  /*
    "returnTicker":{
      "BTC_LTC":{"last":"0.0251","lowestAsk":"0.02589999","highestBid":"0.0251","percentChange":"0.02390438",
        "baseVolume":"6.16485315","quoteVolume":"245.82513926"},
      "BTC_NXT":{"last":"0.00005730","lowestAsk":"0.00005710", "highestBid":"0.00004903","percentChange":"0.16701570",
        "baseVolume":"0.45347489","quoteVolume":"9094"}
    },
 */

}
