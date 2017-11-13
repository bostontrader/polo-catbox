import Shape, {number, format, regexes} from 'matches-shape'
const test = require('ava')

const engine = require('../tradeEngine')

// Given the result from returnLoanOffers, verify the shape
const testLoanOffersShape = (t, loanOrders) => {
  // 1. is the main result an object?
  t.is(new Shape({}).matches(loanOrders), true)

  // 2. are the individual offer orders correctly shaped?
  const orderShape = new Shape({
    id: number,
    rate: number,
    amount: number,
    duration: number,
    autoRenew: number,
    date: format(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)
  })

  // Orders are grouped by currency...
  Object.entries(loanOrders).forEach(entry => {
    // And then each order is an array element
    entry[1].forEach(order => {
      // 2a. do they have the correct keys?
      if (orderShape.matches(order)) {
      } else {
        console.log(29, orderShape.lastNonMatches())
      }
      t.is(orderShape.matches(order), true)

      // 2b. do they have any extra keys?
      t.deepEqual(Object.keys(order), ['id', 'rate', 'amount', 'duration', 'autoRenew', 'date'])
    })
  })
}

test.serial(t => {
  // 1. Test the empty server
  let loanOffers
  engine.brainWipe()

  loanOffers = engine.returnOpenLoanOffers('me')
  t.deepEqual(loanOffers, [])

  // 2. One loan for somebody else
  engine.createLoanOffer('others', 'BTC', 50, 2, 1, 0.02, '2017-08-01 01:15:00')
  loanOffers = engine.returnOpenLoanOffers('me')
  t.deepEqual(loanOffers, [])

  // 3. One loan, one currency
  engine.createLoanOffer('me', 'BTC', 50, 2, 1, 0.02, '2017-08-01 01:15:00')
  loanOffers = engine.returnOpenLoanOffers('me')
  testLoanOffersShape(t, loanOffers)

  // 3.1 Should have exactly one offer.
  t.is(loanOffers.BTC.length, 1)

  // 3.2 Test the value
  t.deepEqual(loanOffers.BTC[0],
    {
      id: 666,
      rate: 0.02,
      amount: 50,
      duration: 2,
      autoRenew: 1,
      date: '2017-08-01 01:15:00'
    }
  )

  // 4. two loans for the same currency
  engine.createLoanOffer('me', 'BTC', 60, 3, 1, 0.025, '2017-08-01 01:15:00')
  loanOffers = engine.returnOpenLoanOffers('me')
  testLoanOffersShape(t, loanOffers)

  // 4.1 Should have exactly two offers.
  t.is(loanOffers.BTC.length, 2)

  // 5. two loans for the same currency and one for a 2nd currency
  engine.createLoanOffer('me', 'CLAM', 50, 2, 1, 0.02, '2017-08-01 01:15:00')
  loanOffers = engine.returnOpenLoanOffers('me')
  testLoanOffersShape(t, loanOffers)

  // 5.1 Should have exactly one offer.
  t.is(loanOffers.CLAM.length, 1)

  // 5.2 Test the value
  t.deepEqual(loanOffers.CLAM[0],
    {
      id: 666,
      rate: 0.02,
      amount: 50,
      duration: 2,
      autoRenew: 1,
      date: '2017-08-01 01:15:00'
    }
  )
})
