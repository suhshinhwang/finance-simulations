const _ = require("lodash")
const prices = require("../../resource/converted/portfolioClosingPrices.json")

const { getCorrelation } = require("../statistics")
const { log } = require("../../src/utils")

const dates = _.keys(prices)
const tickers = _.keys(prices[dates[0]])

const pricesByTicker = _.reduce(tickers, (pricesByTicker, ticker) => {
  if (pricesByTicker[ticker] == null) {
    pricesByTicker[ticker] = []
  }
  dates.forEach(date => {
    pricesByTicker[ticker].push(prices[date][ticker])
  })

  return pricesByTicker;
}, {})

const correlationMatrix = _.reduce(tickers, (matrix, ticker) => {
  const tickerPrices = pricesByTicker[ticker]

  const correlationsOfThisTicker = _.reduce(tickers, (correlationByTicker, otherTicker) => {
    const otherTickerPrices = pricesByTicker[otherTicker]

    correlationByTicker[otherTicker] = _.round(getCorrelation(tickerPrices, otherTickerPrices), 4)
    return correlationByTicker
  }, {})

  matrix[ticker] = correlationsOfThisTicker
  return matrix;
}, {})

console.table(correlationMatrix)

