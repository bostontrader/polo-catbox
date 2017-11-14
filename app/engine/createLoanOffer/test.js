const test = require('ava')

const engine = require('../tradeEngine')

test.serial(t => {
  engine.brainWipe()

  // 1. In order to make a loan offer we must first have some currency to loan.
  engine.makeDeposit('me', 'BTC', 5000)

  // 2. Now create the loan offer
  const currency = 'BTC'
  const amount = 100
  const duration = 90
  const autoRenew = 0
  const lendingRate = 1
  const orderID = 5000

  const actual = engine.createLoanOffer('me', currency, amount, duration, autoRenew, lendingRate, '2017-08-01 01:15:00', orderID)
  const expected = {success: 1, message: 'Loan order placed.', orderID}

  t.deepEqual(actual, expected)
})
