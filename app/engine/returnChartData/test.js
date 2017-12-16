const test = require('ava')
const config = require('config')

const c = require('./constants')
const SNBnCTest = require('./SNBnC')
const SNDTest = require('./SND')
const engine = require('../tradeEngine')

/*
Recall that all candle sticks have a datetime that is a multiple of the period.  The start and end datetime parameters are guidelines that influence, but not specify, the actual datetime of the candle sticks produced.  Each trade occurs in one of these periods.

We want to test the permutations of the following seven things:

The temporal relationship between:

1) The start and end datetimes
2) The start datetime and the timing of the first candle stick period.
3) The last datetime and the timing of the last candle stick period.
4) The first trade datetime and the timing of the first candle stick period.
5) The last trade datetime and the timing of the lasts candle stick period.

As well as...

6) The quantity of existing trades, per period, to summarize, (ie. 0, 1, or many)
7) The period duration.
.

More particularly...

1. The start and end datetimes conspire to determine the actual candle stick periods to produce.  I have identified 5 major variations (SNA, ..., SNE) and a combined 28 useful permutations (SN00, ..., SN27). Because it's incredibly tedious to describe these permutations with words, I will draw charts and number them.  Later I will refer to each case by its number.

SNA If the end < the start, this is absurd.  This particular case should be immediately caught by the engine and spat out.  It doesn't matter whether or not trades exist.  The only case here is:

SN00 - The engine will return an empty candlestick.
.

SNB If the start === the end, then only one candlestick period will be produced. If so:

SN01 - start === end === the first datetime of the period.
SN02 - start === end === a datetime in the interior of the period
SN03 - start === end === the last datetime of the period.

start                   end
         _________
SN01 -> |         | <- SN01
SN02 -> |         | <- SN02
        |         |
        |         |
SN03 -> |_________| <- SN03
.

SNC If the start < end, they might still be in the same period.  If so:

SN04 - start === the first datetime of the period and end = start + 1
SN05 - start is in the interior of the period and end = start + 1, such that end < the last datetime in the period
SN06 - start is in the interior of the period and end = start + 1, such that end === the last dateime in the period

SN07 - start === the first datetime of the period and end = start + 2
SN08 - start is in the interior of the period and end = start + 2, such that end < the last datetime in the period
SN09 - start is in the interior of the period and end = start + 2, such that end === the last dateime in the period

start                   end    start                    end
         _________                       _________
SN04 -> |         |            SN07 ->  |         |
SN05 -> |         | <- SN04    SN08 ->  |         |
        |         | <- SN05    SN09 ->  |         | <- SN07
SN06 -> |         |                     |         | <- SN08
        |_________| <- SN06             |_________| <- SN09
.

SND If the start < end, they might be in two contiguous periods.  If so then there are nine permutations possible.  The start can be the first datetime of the first period, in the interior of, or the last datetime, while the end can be in the same positions for the last period.  In charts, this looks like:

start                         end    start                         end    start                         end
               _________                            _________                            _________
SN10,11,12 -> |         |                          |         |                          |         |
              |         |            SN13,14,15 -> |         |                          |         |
              |         |                          |         |                          |         |
              |         |                          |         |                          |         |
              |_________|                          |_________|            SN16,17,18 -> |_________|
              |         | <- SN10                  |         | <- SN13                  |         | <- SN16
              |         | <- SN11                  |         | <- SN14                  |         | <- SN17
              |         |                          |         |                          |         |
              |         |                          |         |                          |         |
              |_________| <- SN12                  |_________| <- SN15                  |_________| <- SN18
.

SNE If the start < end, they might be in three contiguous periods.  If so then there are nine permutations possible.  The start can be the first datetime of the first period, in the interior of, or the last datetime, while the end can be in the same positions for the last period.  In charts, this looks like:

start                         end    start                         end    start                         end
               _________                            _________                            _________
SN19,20,21 -> |         |                          |         |                          |         |
              |         |            SN22,23,24 -> |         |                          |         |
              |         |                          |         |                          |         |
              |         |                          |         |                          |         |
              |_________|                          |_________|            SN25,26,27 -> |_________|
              |         |                          |         |                          |         |
              |         |                          |         |                          |         |
              |         |                          |         |                          |         |
              |         |                          |         |                          |         |
              |_________|                          |_________|                          |_________|
              |         | <- SN19                  |         | <- SN22                  |         | <- SN25
              |         | <- SN20                  |         | <- SN23                  |         | <- SN26
              |         |                          |         |                          |         |
              |         |                          |         |                          |         |
              |_________| <- SN21                  |_________| <- SN24                  |_________| <- SN27
.

Given the prior enumerated permutations of start and end and their resulting candlestick periods, the following additional permutations apply.

The datetime of the first trade can be:
before the start of the first period
=== the first period datetime
within the first period
at the very end of the first period
after the first period

The datetime of the last trade can be:
before the start of the last period
=== the last period datetime
within the last period
at the very end of the last period
after the last period
.

Finally:

The quantity of existing trades, per period, can be 0, 1, or 2 (many).

The period duration can be 900 or 1800 seconds.

The test will generate quantity trades, for each relevant period, for each permutation.  The terms "first" and "last" trade do not necessarily mean two different trades.  If there is only one trade, it is obviously the first and last trade.  In cases where the first and last trade appear in the same period, ignore the last trade and only use the first trade.

Although I barely have enough fingers and toes to figure all this out, it looks like 28 x 5 x 5 x 3 x 2 = 4200 permutations to generate and test.  But fear not.  A lot of these cases are logically equavalent or absurd and are easily detected and pruned.  And besides, software never gets bored or careless anyhow, so just let 'er rip!

Note: This testing plan does not cover the situation whereby there are empty periods (periods that contain zero trades) between the start and end periods.
 */

let cnt = 0
let results

const market = config.get('testData.markets')[0]
let start, end

test(t => {
  Object.keys(c.startNend28).forEach(sne28 => {
    // console.log('cnt=', cnt, 'sne=', c.startNend28[sne28].p, 'sne28=', sne28)

    // We only want to run this test one time.  Catch it here first.
    if (c.startNend28[sne28].p === c.startNend.SNA) {
      // This is logically absurd, but let's see how it reacts anyway...
      start = 1000
      end = 999
      engine.brainWipe()
      results = {}
      results.actual = engine.returnChartData(market, start, end, 1000)
      results.expected = [engine.emptyCandleStick]
      t.deepEqual(results.actual, results.expected)
      cnt++
    } else {
      // Continue with the other permutations
      Object.keys(c.firstTradeTiming).forEach(firstTradeTiming => {
        Object.keys(c.lastTradeTiming).forEach(lastTradeTiming => {
          c.periods.forEach(period => {
            c.quanTrades.forEach(quantity => {
              // console.log('cnt=', cnt, firstTradeTiming, lastTradeTiming, 'p=', period, 'q=', quantity)
              engine.brainWipe()
              results = {}
              if (quantity === 0) {
                // If there are zero trades, then it doesn't matter what times we feed to returnChartData.
                start = 1000
                end = 1000
                // engine.brainWipe()
                // results = {}
                results.actual = engine.returnChartData(market, start, end, period * 1000)
                results.expected = [engine.emptyCandleStick]
              } else if (c.startNend28[sne28].p === c.startNend.SNB) {
                // Temporally, where in the first (and only) period is the start datetime?
                // In this case, the end datetime is the same.
                let fpOffset
                let lpOffset = 0
                if (sne28 === 'SN01') {
                  fpOffset = 0
                } else if (sne28 === 'SN02') {
                  fpOffset = 1
                } else if (sne28 === 'SN03') {
                  fpOffset = period - 0.001
                }
                results = SNBnCTest(c.firstTradeTiming[firstTradeTiming], c.lastTradeTiming[lastTradeTiming], period, quantity, fpOffset, lpOffset)
              } else if (c.startNend28[sne28].p === c.startNend.SNC) {
                // Temporally, where in the first (and only) period is the start datetime?
                let fpOffset
                let lpOffset
                if (sne28 === 'SN04') {
                  fpOffset = 0; lpOffset = 1
                } else if (sne28 === 'SN05') {
                  fpOffset = 1; lpOffset = 1
                } else if (sne28 === 'SN06') {
                  fpOffset = period - 1.001; lpOffset = 1
                } else if (sne28 === 'SN07') {
                  fpOffset = 0; lpOffset = 2
                } else if (sne28 === 'SN08') {
                  fpOffset = 1; lpOffset = 2
                } else if (sne28 === 'SN09') {
                  fpOffset = period - 2.001; lpOffset = 2
                }
                results = SNBnCTest(c.firstTradeTiming[firstTradeTiming], c.lastTradeTiming[lastTradeTiming], period, quantity, fpOffset, lpOffset)
              } else if (c.startNend28[sne28].p === c.startNend.SND) {
                // Temporally, where in the first (and only) period is the start datetime?
                let fpOffset
                let lpOffset
                if (sne28 === 'SN10') {
                  fpOffset = 0; lpOffset = 1
                } // else if (sne28 === 'SN05') {
                // fpOffset = 1; lpOffset = 1
                // } else if (sne28 === 'SN06') {
                // fpOffset = period - 1.001; lpOffset = 1
                // } else if (sne28 === 'SN07') {
                // fpOffset = 0; lpOffset = 2
                // } else if (sne28 === 'SN08') {
                // fpOffset = 1; lpOffset = 2
                // } else if (sne28 === 'SN09') {
                // fpOffset = period - 2.001; lpOffset = 2
                // }
                results = SNDTest(c.firstTradeTiming[firstTradeTiming], c.lastTradeTiming[lastTradeTiming], period, quantity, fpOffset, lpOffset)
              }
              t.deepEqual(results.actual, results.expected, 'deepEqual cnt=' + cnt)
              cnt++
            })
          })
        })
      })
    }
    // cnt++
  })
})
