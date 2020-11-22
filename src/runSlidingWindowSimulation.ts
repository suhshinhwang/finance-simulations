import * as _ from "lodash"
import { DateTime, Duration } from 'luxon';
import { OpenClosePriceByFundByDate } from "./types"
import { findClosestDate, dateFrom, formatDate, log } from "./utils"

type ComputeMarketValuesFunction<R> = (price) => R

function runSlidingWindowSimulation<R>(
  prices: OpenClosePriceByFundByDate,
  horizon: Duration,
  computeMarketValuesFunction: ComputeMarketValuesFunction<R>
): R[] {
  const priceDateStrings = Object.keys(prices)
  const priceDates = priceDateStrings.map(dateFrom)
  const indexOfPriceDateStrings = _.reduce(priceDateStrings, (indexes, string, index) => {
    indexes[string] = index

    return indexes;
  }, {})

  const lastDayFromData = dateFrom(_.last(priceDateStrings))
  const horizonDurationBeforeLastDataDay = DateTime.fromJSDate(lastDayFromData).minus(horizon).toJSDate()
  const dateStringThatIsHorizonDurationBeforeLastDataDate = formatDate(findClosestDate(priceDates, formatDate(horizonDurationBeforeLastDataDay)))

  // iterate from 0 to this index
  const lastDateOfDataIndex = indexOfPriceDateStrings[dateStringThatIsHorizonDurationBeforeLastDataDate]

  const simulationResults = []
  for (let i = 0; i <= lastDateOfDataIndex; i++) {
    const startDateString = priceDateStrings[i]
    const endDate = DateTime.fromJSDate(dateFrom(startDateString)).plus(horizon).toJSDate()
    const lastDateString = formatDate(findClosestDate(priceDates, endDate))
    const lastDateIndex = indexOfPriceDateStrings[lastDateString]

    const pricesThisSimulation = _.reduce(priceDateStrings.slice(i, lastDateIndex + 1), (pricesByDate, date) => {
      pricesByDate[date] = prices[date]
      return pricesByDate
    }, {})

    simulationResults.push(computeMarketValuesFunction(pricesThisSimulation))
  }
  return simulationResults
}

export { runSlidingWindowSimulation }