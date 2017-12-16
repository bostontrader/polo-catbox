const test = require('ava')

const engine = require('../tradeEngine')

/*
This test should make a series of deposits. After each deposit, the balance should change by the expected amount,
but only for the expected user and only for the expected currency.

                                 me          other
                            cur1  cur2    cur1  cur2
1. start                       0     0       0     0
2. deposit for me, cur1        c    nc      nc    nc
3. deposit for him, cur2      nc    nc      nc     c
4. deposit for me, cur1        c    nc      nc    nc
5. deposit for me, cur2       nc     c      nc    nc

(c = change, nc = no change)
 */

test(t => {
  const verifyBalances = () => {
    verifySingleBalance('me', meBalance1, currency1)
    verifySingleBalance('me', meBalance2, currency2)
    verifySingleBalance('other', otherBalance1, currency1)
    verifySingleBalance('other', otherBalance2, currency2)
  }
  const verifySingleBalance = (user, expectedBalance, currency) => {
    const balances = engine.returnBalances(user)
    t.is(balances[currency], expectedBalance)
  }

  const currency1 = 'BTC'
  const currency2 = 'CLAM'

  let meBalance1 = 0
  let meBalance2 = 0

  let otherBalance1 = 0
  let otherBalance2 = 0

  // 1. Verify initial balances
  verifyBalances()

  // 2. make deposit for me cur1
  engine.makeDeposit('me', currency1, 500)
  meBalance1 += 500
  verifyBalances()

  // 3. make deposit for him, cur2
  engine.makeDeposit('other', currency2, 600)
  otherBalance2 += 600
  verifyBalances()

  // 4. make deposit for me, cur1
  engine.makeDeposit('me', currency1, 700)
  meBalance1 += 700
  verifyBalances()

  // 5. make deposit for me, cur2
  engine.makeDeposit('me', currency2, 800)
  meBalance2 += 800
  verifyBalances()
})
