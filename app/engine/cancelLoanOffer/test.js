const test = require('ava')
const engine = require('../tradeEngine')
const c = require('../../poloConstants')

test.serial(t => {
  let actual, expected
  engine.brainWipe()

  // 1. First create two loan offers to play with
  engine.createLoanOffer('me', 'BTC', 100, 90, 0, 1, '2017-08-01 01:15:00', 5000)
  engine.createLoanOffer('others', 'BTC', 200, 70, 0, 1, '2017-08-01 02:15:00', 6000)

  // 2. Now try to cancel a non-existent order
  actual = engine.cancelLoanOffer('me', 4000)
  expected = {success: 0, error: c.cancelLoanOffer.ERROR_OR_NOT_YOU}
  t.deepEqual(actual, expected)

  // 2.1 Should still be two open orders
  t.is(engine.loanOffers.filter(offer => offer.open).length, 2)

  // 3. Now try to cancel an order that's not mine
  actual = engine.cancelLoanOffer('me', 6000)
  expected = {success: 0, error: c.cancelLoanOffer.ERROR_OR_NOT_YOU}
  t.deepEqual(actual, expected)

  // 3.1 Should still be two orders including orderID 6000
  t.is(engine.loanOffers.filter(offer => offer.open).length, 2)
  t.is(engine.loanOffers.filter(offer => offer.open && offer.orderID === 6000).length, 1)

  // 4. Now cancel successfully.
  actual = engine.cancelLoanOffer('me', 5000)
  expected = {success: 1, message: c.cancelLoanOffer.CANCELED, amount: 100}
  t.deepEqual(actual, expected)

  // 4.1 Should only be one open order, and none for orderID 5000
  t.is(engine.loanOffers.filter(offer => offer.open).length, 1)
  t.is(engine.loanOffers.filter(offer => offer.open && offer.orderID === 5000).length, 0)

  // 5. Now try to cancel a closed order
  actual = engine.cancelLoanOffer('me', 5000)
  expected = {success: 0, error: c.cancelLoanOffer.ERROR_OR_NOT_YOU}
  t.deepEqual(actual, expected)

  // 5.1 Should only be one open order, and none for orderID 5000
  t.is(engine.loanOffers.filter(offer => offer.open).length, 1)
})
