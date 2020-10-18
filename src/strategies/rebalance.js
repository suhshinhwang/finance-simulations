const _ = require("lodash");
const { DateTime } = require("luxon")
const { dateFrom } = require("../utils")

function getAnnualEquityRatio(yearCounts, equityRatio) {
  if (equityRatio instanceof Function) {
    return _.range(0, yearCounts).map(equityRatio);
  } else {
    return Array(yearCounts).fill(equityRatio, 0, yearCounts + 1);
  }
}

module.exports.getAnnualEquityRatio = getAnnualEquityRatio

function getEquityRatios(dateStrings, equityRatioFunction) {
  if (dateStrings.length === 0) {
    return []
  }
  if (dateStrings.length === 1) {
    return getAnnualEquityRatio(1, equityRatioFunction)
  }

  const yearsBetweenDates = DateTime.fromJSDate(dateFrom(_.last(dateStrings))).diff(DateTime.fromJSDate(dateFrom(dateStrings[0])), 'years').toObject().years
  const annualEquityRatios = getAnnualEquityRatio(_.ceil(yearsBetweenDates), equityRatioFunction)
  const equityRatiosByYear = _.reduce(annualEquityRatios, (ratioByYear, ratio, index) => {
    const yearString = DateTime.fromJSDate(dateFrom(dateStrings[0])).year + index
    ratioByYear[yearString] = ratio
    return ratioByYear;
  }, {})

  return dateStrings.map(string => equityRatiosByYear[string.substr(0, 4)])

}

module.exports.getEquityRatios = getEquityRatios

function initializePortfolioByEquityRatio(investmentAmount, initialEquityRatio) {
  return function ({ bondOpeningPrice, equityOpeningPrice }) {
    return {
      equityDollars: investmentAmount * initialEquityRatio,
      bondDollars: investmentAmount * (1 - initialEquityRatio)
    }
  }
}

module.exports.initializePortfolioByEquityRatio = initializePortfolioByEquityRatio

function rebalancePortfolioFunction(equityRatioByDate, ratioTolerance) {
  return function ({
    previousDayPortfolio,
    bondOpeningPrice,
    equityOpeningPrice,
    todayDateString,
  }) {
    const equityOpeningValue = previousDayPortfolio.equityShares * equityOpeningPrice;
    const bondOpeningValue = previousDayPortfolio.bondShares * bondOpeningPrice;

    const equityOpeningRatio = equityOpeningValue / (equityOpeningValue + bondOpeningValue);

    let dollarsToPurchaseEquity = 0; // + means to buy equity, - means to sell
    if (Math.abs(equityOpeningRatio - equityRatioByDate[todayDateString]) > ratioTolerance) {
      const totalValue = equityOpeningValue + bondOpeningValue;

      const equityTargetMarketValue = totalValue * equityRatioByDate[todayDateString];

      dollarsToPurchaseEquity = equityTargetMarketValue - equityOpeningValue;
    }

    return {
      equityDollarChange: dollarsToPurchaseEquity,
      bondDollarChange: -dollarsToPurchaseEquity
    }
  }
}

module.exports.rebalancePortfolioFunction = rebalancePortfolioFunction