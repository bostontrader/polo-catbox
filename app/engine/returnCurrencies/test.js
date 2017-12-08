import Shape, { string, number, nul, oneOfType} from 'matches-shape'
const test = require('ava')

const engine = require('../tradeEngine')

test(t => {
  const currencies = engine.returnCurrencies()

  // 1. is the main result an object?
  t.is(new Shape({}).matches(currencies), true)

  // 2. are the individual values correctly shaped?
  const currencyShape = new Shape({
    id: number,
    name: string,
    txFee: string,
    minConf: number,
    depositAddress: oneOfType[nul, string],
    disabled: number,
    delisted: number,
    frozen: number
  })

  Object.entries(currencies).forEach(entry => {

    // 2a. do they have the correct keys?
    t.is(currencyShape.matches(entry[1]), true)

    // 2b. do they have any extra keys?
    t.deepEqual(Object.keys(entry[1]), ['id', 'name', 'txFee', 'minConf', 'depositAddress', 'disabled', 'delisted', 'frozen'])
  })
})
