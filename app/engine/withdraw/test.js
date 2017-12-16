const test = require('ava')

const engine = require('../tradeEngine')

/*
This test should make a series of withdrawals. After each withdrawal, the balance should change by the expected amount,
but only for the expected user and only for the expected currency.

                                    me          other
                               cur1  cur2    cur1  cur2
1. start                          0     0       0     0
2. withdrawal for me, cur1        c    nc      nc    nc
3. withdrawal for him, cur2      nc    nc      nc     c
4. withdrawal for me, cur1        c    nc      nc    nc
5. withdrawal for me, cur2       nc     c      nc    nc

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
  const datetime = 5000

  let meBalance1 = 0
  let meBalance2 = 0

  let otherBalance1 = 0
  let otherBalance2 = 0

  // 1. Verify initial balances
  verifyBalances()

  // 2. make withdrawal for me cur1
  engine.withdraw('me', currency1, 500, datetime)
  meBalance1 -= 500
  verifyBalances()

  // 3. make withdrawal for him, cur2
  engine.withdraw('other', currency2, 600, datetime)
  otherBalance2 -= 600
  verifyBalances()

  // 4. make withdrawal for me, cur1
  engine.withdraw('me', currency1, 700, datetime)
  meBalance1 -= 700
  verifyBalances()

  // 5. make withdrawal for me, cur2
  engine.withdraw('me', currency2, 800, datetime)
  meBalance2 -= 800
  verifyBalances()
})
