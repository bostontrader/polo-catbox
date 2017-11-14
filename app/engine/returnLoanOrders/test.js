import Shape, {number} from 'matches-shape'
const test = require('ava')

const engine = require('../tradeEngine')

// Given the result from returnLoanOrders, verify the shape
const testLoanOrdersShape = (t, loanOrders) => {
  // 1. is the main result an object?
  t.is(new Shape({offers: [], demands: []}).matches(loanOrders), true)

  // 1a. does it have any other keys?
  t.deepEqual(Object.keys(loanOrders), ['offers', 'demands'])

  // 2. are the individual offer orders correctly shaped?

  // offer and demand orders have the same shape.
  const orderShape = new Shape({
    rate: number,
    amount: number,
    rangeMin: number,
    rangeMax: number
  })

  Object.entries(loanOrders.offers).forEach(entry => {
    // 2a. do they have the correct keys?
    t.is(orderShape.matches(entry[1]), true)

    // 2b. do they have any extra keys?
    t.deepEqual(Object.keys(entry[1]), ['rate', 'amount', 'rangeMin', 'rangeMax'])
  })

  Object.entries(loanOrders.demands).forEach(entry => {
    // 3a. do they have the correct keys?
    t.is(orderShape.matches(entry[1]), true)

    // 3b. do they have any extra keys?
    t.deepEqual(Object.keys(entry[1]), ['rate', 'amount', 'rangeMin', 'rangeMax'])
  })
}

test.serial(t => {
  // 1. Test the empty server
  engine.brainWipe()
  let loanOrders = engine.returnLoanOrders()
  testLoanOrdersShape(t, loanOrders)

  // 2. Make a new loan orders.

  // 2a. In order to make a loan offer we must first have some currency to loan.
  engine.makeDeposit('me', 'BTC', 5000)

  // 2b. Now create the loan offer
  engine.createLoanOffer('me', 'BTC', 100, 90, 0, 1)

  // 2c. Verify the shape
  loanOrders = engine.returnLoanOrders()
  testLoanOrdersShape(t, loanOrders)
})
