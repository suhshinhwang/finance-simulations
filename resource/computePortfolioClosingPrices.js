// Used for variance analysis
const fs = require('fs');
const path = require("path")
const _ = require("lodash")

const tickers = ["626", "900", "902", "903", "908", "909"]

const { dateFrom, log } = require("../src/utils")
const { writeJsonToFile } = require("../src/file-utils")

// [ticker]: { [date]: [data] }
const dataByTickers = _.reduce(tickers, (prices, ticker) => {
  const tickerPrices = require(`./rawData/converted-tdb${ticker}.json`)

  const tickerPricesByDate = _.reduce(tickerPrices, (pricesByDate, price) => {
    pricesByDate[price.Date] = price
    return pricesByDate
  }, {})

  prices[ticker] = tickerPricesByDate
  return prices
}, {})

const tickersDateSet = tickers.map(ticker => new Set(_.keys(dataByTickers[ticker])))
const allTickerDates = _.uniq(tickers.flatMap(ticker => _.keys(dataByTickers[ticker])))
const commonTickerDates = _.sortBy(allTickerDates.filter(date => _.every(tickersDateSet, (dateSet) => dateSet.has(date))), d => +(new Date(d)))

// { [date]: {[ticker]: closingPrice }}
const tickerClosingPricesByDate = _.reduce(commonTickerDates, (pricesByDate, date) => {
  const priceByTickerOfDate = _.reduce(tickers, (priceByTicker, ticker) => {
    priceByTicker[ticker] = dataByTickers[ticker][date].Close

    return priceByTicker
  }, {})

  pricesByDate[date] = priceByTickerOfDate
  return pricesByDate
}, {})

const filePath = path.join("resource", "converted", "portfolioClosingPrices.json")
writeJsonToFile(tickerClosingPricesByDate, filePath)