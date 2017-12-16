const test = require('ava')

const engine = require('../tradeEngine')

test(t => {
  engine.brainWipe()

  // 1. In order to make a loan offer we must first have some currency to loan.
  engine.makeDeposit('me', 'BTC', 5000)

  // 2. Now create the loan offer
  const currency = 'BTC'
  const amount = 100
  const duration = 90
  const autoRenew = 0
  const lendingRate = 1
  const loanID = 5000

  const actual = engine.createLoanOffer('me', currency, amount, duration, autoRenew, lendingRate, '2017-08-01 01:15:00', loanID)
  const expected = {success: 1, message: 'Loan order placed.', loanID}

  t.deepEqual(actual, expected)

  // Create loan offer for currency not on loan list
  // Create loan offer w/o enough funds
  // { error: 'Not enough BTC available to offer.', success: 0 }

})
