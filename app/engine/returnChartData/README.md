# Introduction

Given a market, and start and end datetime (in seconds) and a period (in seconds), produce an array of chart data elements that contain the information of interest.

Although the general idea of returnChartData is easy enough to grok, there are a few tedious details that must be understood in order to fully master this.

1. The first thing to understand about this is that the start and end times are, as with the Pirate's Code, guidelines, not hard and fast rules. Each chart data element describes a certain range of trades and you can't use returnChartData to zoom in on a very precise time period.

2. Each chart data element summarizes trades for a certain period. The period param can only be one of 300, 900, 1800, 7200, 14400, 86400 seconds.

3. The datetime of each chart element will always be a multiple of the period.

4. The first chart element datetime will be the highest of:
     the highest multiple of the period <= start.
     the highest multiple of the period <= the first trade found

For example:
start = 700
first trade date = 650
period = 300
first chart element date = 600

start = 700
first trade = 1300
period = 300
first chart element date = 1200

5. The last chart element datetime will be the lowest of:
     the highest multiple of the period < end
     the highest multiple of the period < the last trade found

end = 2000
last trade = 2150
period = 300
last chart element date = 1800

end = 2000
last trade = 1450
period = 300
last chart element date = 1200

6. End can be < start.  This produces an array with a single empty chart data element composed of all zeros.

