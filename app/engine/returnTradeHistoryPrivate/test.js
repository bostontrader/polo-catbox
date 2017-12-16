const test = require('ava')
const config = require('config')
const engine = require('../../engine/tradeEngine')

test(t => {
  let actual, expected

  const currencyPair = config.get('testData.markets')[0]
  const currencies = currencyPair.split('_')
  const baseCurrency = currencies[0]
  const quoteCurrency = currencies[1]

  const tradeDate1 = 86400 // 1970-01-02 00:00:00
  const tradeDate2 = 108000 // 1970-01-02 06:00:00
  const tradeDate3 = 108000 // 1970-01-02 06:00:00

  const tradeResult1 = {
    globalTradeID: 123,
    tradeID: '1',
    date: '1970-01-02 00:00:00',
    rate: '0.01800000',
    amount: '2.00000000',
    total: '0.03600000',
    fee: '0.00150000',
    orderNumber: undefined,
    type: 'sell',
    category: 'exchange'
  }

  const tradeResult2 = {
    globalTradeID: 123,
    tradeID: '1',
    date: '1970-01-02 06:00:00',
    rate: '0.01700000',
    amount: '3.00000000',
    total: '0.05100000',
    fee: '0.00150000',
    orderNumber: undefined,
    type: 'buy',
    category: 'exchange'
  }

  const tradeResult3 = {
    globalTradeID: 123,
    tradeID: '1',
    date: '1970-01-02 06:00:00',
    rate: '0.02500000',
    amount: '5.00000000',
    total: '0.12500000',
    fee: '0.00150000',
    orderNumber: undefined,
    type: 'buy',
    category: 'exchange'
  }

  engine.brainWipe()

  // 1. In the beginning, there are no trades.  We'll never see this in the wild, but make a good guess.
  actual = engine.returnTradeHistoryPrivate('me', 'all', 0, 9999999999)
  expected = []
  t.deepEqual(actual, expected)

  // 2. Now make a single trade and verify that it is in the history.

  // 2.1 In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', baseCurrency, 100)
  engine.makeDeposit('others', quoteCurrency, 100)
  engine.makeDeposit('me', baseCurrency, 100)
  engine.makeDeposit('me', quoteCurrency, 100)
  engine.makeDeposit('me', 'ETH', 100)

  // 2.2 Now submit an order to buy and then an order to sell. Doing so will trigger a trade.
  engine.buy({apiKey: 'others', currencyPair, dt: 2000, rate: 0.018, amount: 2.0, postOnly: 1})
  engine.desiredTradeDate = tradeDate1
  engine.sell({apiKey: 'me', currencyPair, dt: tradeDate1, rate: 0.017, amount: 2.0})

  // 2.3 start < end < tradeDate1
  actual = engine.returnTradeHistoryPrivate('me', 'all', tradeDate1 - 2, tradeDate1 - 1)
  expected = []
  t.deepEqual(actual, expected)

  // 2.4 start < end === tradeDate1.
  actual = engine.returnTradeHistoryPrivate('me', 'all', tradeDate1 - 1, tradeDate1)
  expected = {BTC_LTC: [tradeResult1]}
  t.deepEqual(actual, expected)

  // 2.5 start < tradeDate1 < end
  actual = engine.returnTradeHistoryPrivate('me', 'all', tradeDate1 - 1, tradeDate1 + 1)
  expected = {BTC_LTC: [tradeResult1]}
  t.deepEqual(actual, expected)

  // 3. Make a second trade for the same currency.  This time make it a 'buy'.
  engine.sell({apiKey: 'others', currencyPair, dt: 2000, rate: 0.017, amount: 3.0})
  engine.desiredTradeDate = tradeDate2
  engine.buy({apiKey: 'me', currencyPair, dt: tradeDate2, rate: 0.018, amount: 3.0})

  // 3.1 start < first trade date, end === 1st trade date.  Only one trade.
  actual = engine.returnTradeHistoryPrivate('me', 'all', tradeDate1 - 1, tradeDate1)
  expected = {BTC_LTC: [tradeResult1]}
  t.deepEqual(actual, expected)

  // 3.2 start < 1st trade date, 1st trade date < 2nd trade date && end < 2nd trade date.  Only one trade.
  actual = engine.returnTradeHistoryPrivate('me', 'all', tradeDate1 - 1, tradeDate2 - 1)
  expected = {BTC_LTC: [tradeResult1]}
  t.deepEqual(actual, expected)

  // 3.3 start < 1st trade date, end === 2nd trade date, two trades.
  actual = engine.returnTradeHistoryPrivate('me', 'all', tradeDate1 - 1, tradeDate2)
  expected = {BTC_LTC: [tradeResult1, tradeResult2]}
  t.deepEqual(actual, expected)

  // 3.4 start < 1st trade date, 2nd trade date < end.  two trades.
  actual = engine.returnTradeHistoryPrivate('me', 'all', tradeDate1 - 1, tradeDate2 + 1)
  expected = {BTC_LTC: [tradeResult1, tradeResult2]}
  t.deepEqual(actual, expected)

  // 3.5 start === 1st trade date, 2nd date < end.  two trades.
  actual = engine.returnTradeHistoryPrivate('me', 'all', tradeDate1, tradeDate2 + 1)
  expected = {BTC_LTC: [tradeResult1, tradeResult2]}
  t.deepEqual(actual, expected)

  // 3.6 1st trade date < start, 2nd trade date < end.  last trade.
  actual = engine.returnTradeHistoryPrivate('me', 'all', tradeDate1 + 1, tradeDate2 + 1)
  expected = {BTC_LTC: [tradeResult2]}
  t.deepEqual(actual, expected)

  // 3.7 start === 2nd trade date, 2nd trade date < end. last trade.
  actual = engine.returnTradeHistoryPrivate('me', 'all', tradeDate2, tradeDate2 + 1)
  expected = {BTC_LTC: [tradeResult2]}
  t.deepEqual(actual, expected)

  // 3.8 start and end are after both trades.  empty
  actual = engine.returnTradeHistoryPrivate('me', 'all', tradeDate2 + 1, tradeDate2 + 2)
  expected = []
  t.deepEqual(actual, expected)

  // 4. Make a third trade, this time for a 2nd market
  engine.sell({apiKey: 'others', currencyPair: 'ETH_LTC', dt: 2000, rate: 0.025, amount: 5.0})
  engine.desiredTradeDate = tradeDate2
  engine.buy({apiKey: 'me', currencyPair: 'ETH_LTC', dt: tradeDate3, rate: 0.028, amount: 5.0})
  actual = engine.returnTradeHistoryPrivate('me', 'all', tradeDate1 - 1, tradeDate3 + 1)
  expected = {
    BTC_LTC: [tradeResult1, tradeResult2],
    ETH_LTC: [tradeResult3]
  }
  t.deepEqual(actual, expected)

  // 5. Request a single currencyPair
  actual = engine.returnTradeHistoryPrivate('me', 'ETH_LTC', tradeDate1 - 1, tradeDate3 + 1)
  expected = {
    ETH_LTC: [tradeResult3]
  }
  t.deepEqual(actual, expected)
})
