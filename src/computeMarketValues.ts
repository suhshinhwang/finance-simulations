import * as _ from "lodash"

import { DollarByFund, SharesByFund, OpenClosePriceByFund } from "./types"

type DollarChangeFunction = (input: {
  previousDayPortfolio: ComputedMarketValueOutput,
  openingPrices: DollarByFund,
  todayDateString: string
}) => DollarByFund

type PortfolioInitializationFunction = (openingPriceByFund: DollarByFund) => DollarByFund

type ComputedMarketValueOutput = {
  date: string,
  shares: SharesByFund,
  marketValues: DollarByFund
}

type ComputeMarketValueFunction = {
  prices: { [dateString: string]: OpenClosePriceByFund },
  dollarChangeFunction: DollarChangeFunction,
  portfolioInitializationFunction: PortfolioInitializationFunction
}

function computeMarketValues({
  prices,
  dollarChangeFunction, // + means to buy equity, - means to sell
  portfolioInitializationFunction // Returns initial dollars to buy equity & bonds
}: ComputeMarketValueFunction): ComputedMarketValueOutput[] {
  const availableDateStrings = Object.keys(prices);

  const startDateString = availableDateStrings[0]
  const lastDayIndex = availableDateStrings.length - 1

  const dollarsByFund = portfolioInitializationFunction(prices[startDateString].open)

  const initialSharesByFund = _.reduce(prices[startDateString].close, (sharesByFund, closingPrice, fund) => {
    sharesByFund[fund] = dollarsByFund[fund] / closingPrice
    return sharesByFund
  }, {})

  const values = [{
    shares: initialSharesByFund,
    date: startDateString,
    marketValues: {},
  }];

  for (let i = 0; i <= lastDayIndex; i++) {
    const today = availableDateStrings[i];

    const dollarChangeByFund = dollarChangeFunction({
      previousDayPortfolio: values[i],
      openingPrices: prices[today].open,
      todayDateString: today
    })

    const shareChangesByFund = _.reduce(prices[today].close, (shareChangeByFund, closingPrice, fund) => {
      shareChangeByFund[fund] = dollarChangeByFund[fund] / closingPrice
      return shareChangeByFund
    }, {})

    const todaySharesByFund: SharesByFund = _.reduce(values[i].shares, (sharesByFund, sharesYesterday, fund) => {
      sharesByFund[fund] = sharesYesterday + shareChangesByFund[fund]

      return sharesByFund
    }, {})

    const todayMarketValuesByFund: DollarByFund = _.reduce(todaySharesByFund, (sharesByFund, sharesToday, fund) => {
      sharesByFund[fund] = sharesToday * prices[today].close[fund]
      return sharesByFund;
    }, {})

    values.push({
      date: today,
      shares: todaySharesByFund, // {[fund: shareCount]}
      marketValues: todayMarketValuesByFund,
    });
  }

  return values.slice(1);
}

export { computeMarketValues, DollarChangeFunction, ComputedMarketValueOutput, PortfolioInitializationFunction }