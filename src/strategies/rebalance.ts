import * as _ from "lodash";
import { DateTime } from "luxon";
import { dateFrom, log } from "../utils";
import { DollarChangeFunction, PortfolioInitializationFunction } from "../computeMarketValues"

function getAnnualEquityRatio(yearCounts, equityRatio: EquityRatioFunction | RatioByFund): RatioByFund[] {
  if (equityRatio instanceof Function) {
    return _.range(0, yearCounts).map(equityRatio);
  } else {
    return Array(yearCounts).fill(equityRatio, 0, yearCounts + 1);
  }
}

type EquityRatioFunction = (yearCount: number) => RatioByFund

function getEquityRatios(dateStrings: string[], equityRatioFunction: EquityRatioFunction | RatioByFund): RatioByFund[] {
  if (dateStrings.length === 0) {
    return []
  }
  if (dateStrings.length === 1) {
    return getAnnualEquityRatio(1, equityRatioFunction)
  }

  const yearsBetweenDates = DateTime.fromJSDate(dateFrom(_.last(dateStrings))).diff(DateTime.fromJSDate(dateFrom(dateStrings[0])), 'years').toObject().years + 1
  const annualEquityRatios = getAnnualEquityRatio(_.ceil(yearsBetweenDates), equityRatioFunction)
  const equityRatiosByYear: { [dateString: string]: RatioByFund } = _.reduce(annualEquityRatios, (ratioByYear, ratio, index) => {
    const yearString = `${DateTime.fromJSDate(dateFrom(dateStrings[0])).year + index}`
    ratioByYear[yearString] = ratio
    return ratioByYear;
  }, {})

  return dateStrings.map(string => equityRatiosByYear[string.substr(0, 4)])
}

type RatioByFund = { [fund: string]: number }

function initializePortfolioByEquityRatio(investmentAmount, initialEquityRatioByFund: RatioByFund): PortfolioInitializationFunction {
  return function (openingPriceByFund) {
    return _.reduce(initialEquityRatioByFund, (dollarByFund, ratio, fund) => {
      dollarByFund[fund] = ratio * investmentAmount

      return dollarByFund
    }, {})
  }
}

function rebalancePortfolioFunction(ratiosByFund: { [date: string]: RatioByFund }, ratioTolerance: number): DollarChangeFunction {
  return function ({
    previousDayPortfolio,
    openingPrices,
    todayDateString
  }) {

    const openingValuesByFund = _.reduce(previousDayPortfolio.shares, (valuesByFund, shares, fund) => {
      valuesByFund[fund] = shares * openingPrices[fund]

      return valuesByFund
    }, {})

    const openingPriceSum = _.sum(_.map(openingValuesByFund, (openingPrice) => openingPrice))

    const openingRatiosByFunds = _.reduce(openingValuesByFund, (ratios, openingPrice, fund) => {
      ratios[fund] = openingPrice / openingPriceSum

      return ratios
    }, {})

    const shouldRebalance = _.reduce(openingRatiosByFunds, (shouldRebalance, ratio, fund) => {
      if (ratiosByFund[todayDateString] == null) {
        log(todayDateString)
      }
      return shouldRebalance || (Math.abs(ratio - ratiosByFund[todayDateString][fund]) > ratioTolerance)
    }, false)

    const dollarChangeByFunds = shouldRebalance ?
      _.reduce(openingValuesByFund, (changes, price, fund) => {
        changes[fund] = openingPriceSum * ratiosByFund[todayDateString][fund] - price

        return changes
      }, {}) : _.reduce(_.keys(openingValuesByFund), (changes, fund) => {
        changes[fund] = 0

        return changes
      }, {})

    return dollarChangeByFunds
  }
}

export {
  rebalancePortfolioFunction,
  getEquityRatios,
  getAnnualEquityRatio,
  initializePortfolioByEquityRatio,
  RatioByFund
}