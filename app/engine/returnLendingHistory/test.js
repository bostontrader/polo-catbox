const test = require('ava')
const engine = require('../../engine/tradeEngine')

test(t => {
  let actual, expected

  const offer1 = {apiKey: 'me', currency: 'BTC', amount: 10, duration: 2, autoRenew: 0, rate: 0.10, offerDatetime: 1000, loanID: 666}
  const offer2 = {apiKey: 'me', currency: 'LTC', amount: 20, duration: 4, autoRenew: 0, rate: 0.20, offerDatetime: 1050, loanID: 667}
  const offer3 = {apiKey: 'me', currency: 'ETH', amount: 20, duration: 4, autoRenew: 0, rate: 0.25, offerDatetime: 1100, loanID: 668}

  const firstEndDate = 108000
  const secondEndDate = 118800

  const offer1Result = {
    id: 666,
    currency: 'BTC',
    rate: '0.10000000',
    amount: '10.00000000',
    duration: '0.25000000',
    interest: '0.25000000',
    fee: '-0.03750000',
    earned: '0.21250000',
    open: '1970-01-02 00:00:00',
    close: '1970-01-02 06:00:00'
  }
  const offer2Result = {
    id: 667,
    currency: 'LTC',
    rate: '0.20000000',
    amount: '20.00000000',
    duration: '0.37500000',
    interest: '1.50000000',
    fee: '-0.22500000',
    earned: '1.27500000',
    open: '1970-01-02 00:00:00',
    close: '1970-01-02 09:00:00'
  }

  engine.brainWipe()

  // 1. Setup some loans to work with

  // 1.1 Start with three loan offers.
  engine.createLoanOffer(offer1.apiKey, offer1.currency, offer1.amount, offer1.duration, offer1.autoRenew, offer1.rate, offer1.offerDatetime, offer1.loanID)
  engine.createLoanOffer(offer2.apiKey, offer2.currency, offer2.amount, offer2.duration, offer2.autoRenew, offer2.rate, offer2.offerDatetime, offer2.loanID)
  engine.createLoanOffer(offer3.apiKey, offer3.currency, offer3.amount, offer3.duration, offer3.autoRenew, offer3.rate, offer3.offerDatetime, offer3.loanID)

  // 1.2 Now accept two of them.
  engine.acceptLoan('others', 666, 86400) // 1970-01-02 00:00:00
  engine.acceptLoan('others', 667, 86400)
  engine.acceptLoan('others', 668, 2200)

  // 2. Although one loan is still on offer and two others have been accepted, nothing has been repaid yet so there is no 'loan history' yet.
  actual = engine.returnLendingHistory('me', 0, secondEndDate + 1)
  expected = []
  t.deepEqual(actual, expected)

  // Loans are accepted and repaid via the machination of margin trading.
  // That doesn't work yet, so let's use an easy fix for now.  Let's just accept and repay loans manually.

  // 3. Now repay one of the loan offers and verify that it is in the history.
  engine.repayLoan(666, firstEndDate) // 1970-01-02 06:00:00

  // 3.1 start < end < firstEndDate
  actual = engine.returnLendingHistory('me', firstEndDate - 2, firstEndDate - 1)
  expected = []
  t.deepEqual(actual, expected)

  // 3.2 start < end === firstEndDate.
  actual = engine.returnLendingHistory('me', firstEndDate - 1, firstEndDate)
  expected = [offer1Result]
  t.deepEqual(actual, expected)

  // 3.2 start < firstEndDate < end
  actual = engine.returnLendingHistory('me', firstEndDate - 1, firstEndDate + 1)
  expected = [offer1Result]
  t.deepEqual(actual, expected)

  // 4. Now repay a second loan.
  engine.repayLoan(667, secondEndDate) // 1970-01-02 09:00:00

  // 4.1 start < first end date, end === 1st end date.  Only one loan.
  actual = engine.returnLendingHistory('me', firstEndDate - 1, firstEndDate)
  expected = [offer1Result]
  t.deepEqual(actual, expected)

  // 4.2 start < 1st end date, 1st end date < 2nd end && end < 2nd end date.  Only one loan.
  actual = engine.returnLendingHistory('me', firstEndDate - 1, secondEndDate - 1)
  expected = [offer1Result]
  t.deepEqual(actual, expected)

  // 4.3 start < 1st end date, end === 2nd end date, two loans.
  actual = engine.returnLendingHistory('me', firstEndDate - 1, secondEndDate)
  expected = [offer1Result, offer2Result]
  t.deepEqual(actual, expected)

  // 4.4 start < 1st end date, 2nd end date < end.  two loans.
  actual = engine.returnLendingHistory('me', firstEndDate - 1, secondEndDate + 1)
  expected = [offer1Result, offer2Result]
  t.deepEqual(actual, expected)

  // 4.5 start === 1st end date, 2nd date < end.  two loans.
  actual = engine.returnLendingHistory('me', firstEndDate, secondEndDate + 1)
  expected = [offer1Result, offer2Result]
  t.deepEqual(actual, expected)

  // 4.6 1st end date < start, 2nd end date < end.  last loan.
  actual = engine.returnLendingHistory('me', firstEndDate + 1, secondEndDate + 1)
  expected = [offer2Result]
  t.deepEqual(actual, expected)

  // 4.7 start === 2nd date, 2nd date < end. last loan.
  actual = engine.returnLendingHistory('me', secondEndDate, secondEndDate + 1)
  expected = [offer2Result]
  t.deepEqual(actual, expected)

  // 4.8 start and end are after both loans.  empty
  actual = engine.returnLendingHistory('me', secondEndDate + 1, secondEndDate + 2)
  expected = []
  t.deepEqual(actual, expected)
})
