const _ = require("lodash")
const { findClosestDate, formatDate, dateFrom, durationBetweenInDays } = require("./utils")
const { DateTime } = require("luxon")

/**
 * This function tries to answer: Given `h` years to invest with a flexibility of withdrawing `y` years later,
 * what is the probability that the investments are worse than annual rate of return `r`?
 */
function whenInvestmentBetterThanProjection({
  marketValues, // use getRebalancedValues() output
  horizon,
  withdrawalFlexibilityDuration,
  expectedGrowthRate
}) {
  const firstDateString = marketValues[0].date
  const stringDates = marketValues.map(v => v.date)
  const dates = stringDates.map(dateFrom);

  const closestDateToHorizonString = formatDate(findClosestDate(dates, DateTime.fromJSDate(dateFrom(firstDateString)).plus(horizon).toJSDate()))
  const closestDateToEndString = formatDate(findClosestDate(
    dates,
    DateTime.fromJSDate(dateFrom(firstDateString)).plus(horizon).plus(withdrawalFlexibilityDuration).toJSDate()
  ))

  const marketValuesByDate = {};

  marketValues.forEach((value) => {
    marketValuesByDate[value.date] = {
      'equityMarketValue': value.equityMarketValue,
      'bondMarketValue': value.bondMarketValue
    }
  });

  function getTotalMarketValueOnDate(dateString) {
    return marketValuesByDate[dateString].equityMarketValue + marketValuesByDate[dateString].bondMarketValue
  }

  const initialMarketValue = getTotalMarketValueOnDate(firstDateString)
  // TODO need to adjust this calculation when withdrawalFlexibilityDuration is greater than 1 year
  const projectedValue = initialMarketValue * Math.pow(1 + expectedGrowthRate, horizon.years || 0);

  const closestDateToHorizonIndex = stringDates.findIndex((d) => d === closestDateToHorizonString);
  const closestDateToEndIndex = stringDates.findIndex((d) => d === closestDateToEndString);

  const marketValueAtHorizon = getTotalMarketValueOnDate(closestDateToHorizonString)

  if (marketValueAtHorizon >= projectedValue) {
    return {
      betterThanProjected: true,
      extraDaysToWait: 0,
      bondValue: marketValuesByDate[closestDateToHorizonString].bondMarketValue,
      equityValue: marketValuesByDate[closestDateToHorizonString].equityMarketValue
    };
  } else {
    const datesToFind = stringDates.slice(closestDateToHorizonIndex, closestDateToEndIndex + 1);
    const dateWhereValueIsGreaterThanProjected = datesToFind.find((dateString) => {
      return getTotalMarketValueOnDate(dateString) >= projectedValue;
    });

    if (dateWhereValueIsGreaterThanProjected != null) {
      const durationAfterHorizon = durationBetweenInDays(dateFrom(closestDateToHorizonString), dateFrom(dateWhereValueIsGreaterThanProjected))

      return {
        betterThanProjected: true,
        extraDaysToWait: durationAfterHorizon,
        bondValue: marketValuesByDate[dateWhereValueIsGreaterThanProjected].bondMarketValue,
        equityValue: marketValuesByDate[dateWhereValueIsGreaterThanProjected].equityMarketValue
      };
    } else {
      const marketValuesBetweenDates = datesToFind.map(dateString => getTotalMarketValueOnDate(dateString))
      const maxMarketValueBetweenDates = _.max(marketValuesBetweenDates)
      const dateIndexAtMaxMarketValue = marketValuesBetweenDates.findIndex(v => v === maxMarketValueBetweenDates)
      const dateAtMaxMarketValue = datesToFind[dateIndexAtMaxMarketValue]

      const durationAfterHorizon = durationBetweenInDays(dateFrom(closestDateToHorizonString), dateFrom(dateAtMaxMarketValue))

      return {
        betterThanProjected: false,
        extraDaysToWait: durationAfterHorizon,
        bondValue: marketValuesByDate[dateAtMaxMarketValue].bondMarketValue,
        equityValue: marketValuesByDate[dateAtMaxMarketValue].equityMarketValue
      }
    }
  }
}

module.exports.whenInvestmentBetterThanProjection = whenInvestmentBetterThanProjection