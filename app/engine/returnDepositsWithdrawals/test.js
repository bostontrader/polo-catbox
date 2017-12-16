const test = require('ava')
const engine = require('../tradeEngine')

test(t => {
  let depositsWithdrawals, expected
  const END_OF_TIME = 9999999999
  const firstDatetime = 5000
  const secondDatetime = 6000

  const firstDeposit = {user: 'me', currency: 'BTC', amount: 500, datetime: firstDatetime}
  const firstDepositResult = {
    currency: firstDeposit.currency,
    address: 'random address',
    amount: firstDeposit.amount,
    confirmations: 1,
    txid: 'random tx id',
    timestamp: firstDeposit.datetime,
    status: 'COMPLETE'
  }

  const secondDeposit = {user: 'me', currency: 'LTC', amount: 600, datetime: secondDatetime}
  const secondDepositResult = {
    currency: secondDeposit.currency,
    address: 'random address',
    amount: secondDeposit.amount,
    confirmations: 1,
    txid: 'random tx id',
    timestamp: secondDeposit.datetime,
    status: 'COMPLETE'
  }

  const firstWithdrawal = {user: 'me', currency: 'BTC', amount: 500, datetime: firstDatetime, address: 'addr1'}
  const firstWithdrawalResult = {
    withdrawalNumber: 666,
    currency: firstWithdrawal.currency,
    address: 'random address',
    amount: firstWithdrawal.amount,
    fee: 0.00100000,
    timestamp: firstWithdrawal.datetime,
    status: 'COMPLETE: 6a3aa6b2bc44dae58e851cde6b6316bf23d97cbc63d26b5ef2f50ab7dd28a96c',
    ipAddress: '106.185.39.151'
  }

  const secondWithdrawal = {user: 'me', currency: 'LTC', amount: 600, datetime: secondDatetime, address: 'addr2'}
  const secondWithdrawalResult = {
    withdrawalNumber: 666,
    currency: secondWithdrawal.currency,
    address: 'random address',
    amount: secondWithdrawal.amount,
    fee: 0.00100000,
    timestamp: secondWithdrawal.datetime,
    status: 'COMPLETE: 6a3aa6b2bc44dae58e851cde6b6316bf23d97cbc63d26b5ef2f50ab7dd28a96c',
    ipAddress: '106.185.39.151'
  }

  engine.brainWipe()

  // 1. Start with an empty server.
  depositsWithdrawals = engine.returnDepositsWithdrawals('me', 0, END_OF_TIME)
  expected = { deposits: [], withdrawals: [] }
  t.deepEqual(depositsWithdrawals, expected)

  // 2. Make a deposit for somebody else.  Still empty for me.
  engine.makeDeposit('other', 'BTC', 500, firstDatetime)
  depositsWithdrawals = engine.returnDepositsWithdrawals('me', 0, END_OF_TIME)
  expected = { deposits: [], withdrawals: [] }
  t.deepEqual(depositsWithdrawals, expected)

  // 3. Make a deposit for me.  Should have one deposit now.
  engine.makeDeposit(firstDeposit.user, firstDeposit.currency, firstDeposit.amount, firstDeposit.datetime)
  depositsWithdrawals = engine.returnDepositsWithdrawals('me', 0, END_OF_TIME)
  expected = {deposits: [firstDepositResult], withdrawals: []}
  t.deepEqual(depositsWithdrawals, expected)

  // 4. Make another deposit for me.  Should now have two deposits.
  engine.makeDeposit(secondDeposit.user, secondDeposit.currency, secondDeposit.amount, secondDeposit.datetime)
  depositsWithdrawals = engine.returnDepositsWithdrawals('me', 0, END_OF_TIME)
  expected = {deposits: [firstDepositResult, secondDepositResult], withdrawals: []}
  t.deepEqual(depositsWithdrawals, expected)

  // 5. Make a withdrawal for somebody else.  Still no withdrawals for me.
  engine.withdraw('other', 'BTC', 500, firstDatetime, 'someaddr')
  depositsWithdrawals = engine.returnDepositsWithdrawals('me', 0, END_OF_TIME)
  expected = { deposits: [firstDepositResult, secondDepositResult], withdrawals: [] }
  t.deepEqual(depositsWithdrawals, expected)

  // 6. Make a withdrawal for me.  Should have one withdrawal now.
  engine.withdraw(firstWithdrawal.user, firstWithdrawal.currency, firstWithdrawal.amount, firstWithdrawal.address, firstWithdrawal.datetime)
  depositsWithdrawals = engine.returnDepositsWithdrawals('me', 0, END_OF_TIME)
  expected = {deposits: [firstDepositResult, secondDepositResult], withdrawals: [firstWithdrawalResult]}
  t.deepEqual(depositsWithdrawals, expected)

  // 7. Make another withdrawal for me.  Should now have two withdrawals.
  engine.withdraw(secondWithdrawal.user, secondWithdrawal.currency, secondWithdrawal.amount, secondWithdrawal.address, secondWithdrawal.datetime)
  depositsWithdrawals = engine.returnDepositsWithdrawals('me', 0, END_OF_TIME)
  expected = {deposits: [firstDepositResult, secondDepositResult], withdrawals: [firstWithdrawalResult, secondWithdrawalResult]}
  t.deepEqual(depositsWithdrawals, expected)

  // The following tests examine whether or not the start and end times work as expected.  Here, "1st" means the first deposit and withdrawal, and "2nd" means the 2nd deposit and withdrawal.

  // 1. Test start < 1st and 2nd < end.  Get both.  Already done this in prior testing.

  // 2. Test start === 1st and 2nd < end.  Get both.
  depositsWithdrawals = engine.returnDepositsWithdrawals('me', firstDatetime, END_OF_TIME)
  expected = {deposits: [firstDepositResult, secondDepositResult], withdrawals: [firstWithdrawalResult, secondWithdrawalResult]}
  t.deepEqual(depositsWithdrawals, expected)

  // 3. Test 1st < start and 2nd < end.  Get 2nd only.
  depositsWithdrawals = engine.returnDepositsWithdrawals('me', firstDatetime + 1, END_OF_TIME)
  expected = {deposits: [secondDepositResult], withdrawals: [secondWithdrawalResult]}
  t.deepEqual(depositsWithdrawals, expected)

  // 4. Test 1st < start and 2nd === end.  Get 2nd only.
  depositsWithdrawals = engine.returnDepositsWithdrawals('me', firstDatetime + 1, secondDatetime)
  expected = {deposits: [secondDepositResult], withdrawals: [secondWithdrawalResult]}
  t.deepEqual(depositsWithdrawals, expected)

  // 5. Test 1st < start and end < 2nd.  Get nothing.
  depositsWithdrawals = engine.returnDepositsWithdrawals('me', firstDatetime + 1, secondDatetime - 1)
  expected = {deposits: [], withdrawals: []}
  t.deepEqual(depositsWithdrawals, expected)
})
