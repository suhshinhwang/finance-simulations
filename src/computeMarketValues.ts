// const _ = require("lodash");
import * as _ from "lodash"

const OPEN = 'open';
const CLOSE = 'close';
const EQUITY = 'equity';
const BOND = 'bond';

function getPriceOfDay(prices, dateString, openClose, fund) {
  return prices[dateString][openClose][fund];
}

function computeMarketValues({
  prices,
  dollarChangeFunction, // Returns dollars to buy equity & bonds; + means to buy equity, - means to sell
  portfolioInitializationFunction // Returns initial dollars to buy equity & bonds
}) {
  const availableDateStrings = Object.keys(prices);

  const startDateString = availableDateStrings[0]
  const lastDayIndex = availableDateStrings.length - 1

  const { equityDollars, bondDollars } = portfolioInitializationFunction({
    bondOpeningPrice: getPriceOfDay(prices, startDateString, OPEN, BOND),
    equityOpeningPrice: getPriceOfDay(prices, startDateString, OPEN, EQUITY),
  })

  const equitySharesInitial = equityDollars / getPriceOfDay(prices, startDateString, CLOSE, EQUITY);
  const bondSharesInitial = bondDollars / getPriceOfDay(prices, startDateString, CLOSE, BOND);

  const values = [{
    equityShares: equitySharesInitial,
    bondShares: bondSharesInitial,
    date: startDateString,
    equityMarketValue: null,
    bondMarketValue: null,
    ratio: null,
  }];

  for (let i = 0; i <= lastDayIndex; i++) {
    const today = availableDateStrings[i];
    const equitySharesYesterday = values[i].equityShares;
    const bondSharesYesterday = values[i].bondShares;

    const { equityDollarChange, bondDollarChange } = dollarChangeFunction({
      previousDayPortfolio: values[i],
      bondOpeningPrice: getPriceOfDay(prices, today, OPEN, BOND),
      equityOpeningPrice: getPriceOfDay(prices, today, OPEN, EQUITY),
      todayDateString: today
    })

    const equityShareChange = equityDollarChange / getPriceOfDay(prices, today, CLOSE, EQUITY);
    const bondShareChange = bondDollarChange / getPriceOfDay(prices, today, CLOSE, BOND);

    const equitySharesToday = equitySharesYesterday + equityShareChange;
    const bondSharesToday = bondSharesYesterday + bondShareChange;

    const equityCloseValue = equitySharesToday * getPriceOfDay(prices, today, CLOSE, EQUITY);
    const bondCloseValue = bondSharesToday * getPriceOfDay(prices, today, CLOSE, BOND);

    const closingRatio = equityCloseValue / (equityCloseValue + bondCloseValue);

    values.push({
      date: today,
      equityShares: equitySharesToday,
      bondShares: bondSharesToday,
      equityMarketValue: equityCloseValue,
      bondMarketValue: bondCloseValue,
      ratio: closingRatio,
    });
  }

  return values.slice(1);
}

export { computeMarketValues }