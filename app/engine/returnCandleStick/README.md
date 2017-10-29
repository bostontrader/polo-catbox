# Introduction

Given an array of trades, return a basic candle stick.

Said candle stick contains the basic information that summarizes the collection of trades, but does not contain any datetime information.

This should be obviously useful for implementing returnChartData.  But it's also useful in testing the same.  When doing so, how do we know what the expected results should be?  The code is obviously present in the implementation, but it must also be duplicated in the test, in order to determine the expected result.  The tests contain hundreds of permutations of input parameters and it's thus not practical to determine expected results by hand.

Warning! Don't play tricks on this function.  Given an array of trades, it will do its job.  It's the responsibility of the caller to provide a sensible array of trades.