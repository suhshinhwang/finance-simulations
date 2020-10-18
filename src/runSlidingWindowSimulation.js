const _ = require("lodash")
const { DateTime } = require("luxon")
const { findClosestDate, dateFrom, formatDate } = require("./utils")

function runSlidingWindowSimulation(
  prices,
  horizon,
  computeMarketValuesFunction // (price) => any
) {
  const priceDateStrings = Object.keys(prices)
  const priceDates = priceDateStrings.map(dateFrom)

  const lastDayFromData = dateFrom(_.last(priceDateStrings))
  const horizonDurationBeforeLastDataDay = DateTime.fromJSDate(lastDayFromData).minus(horizon).toJSDate()
  const dateStringThatIsHorizonDurationBeforeLastDataDate = formatDate(findClosestDate(priceDates, formatDate(horizonDurationBeforeLastDataDay)))

  // iterate from 0 to this index
  const lastDateOfDataIndex = priceDateStrings.findIndex(s => s === dateStringThatIsHorizonDurationBeforeLastDataDate)

  const simulationResults = []
  for (let i = 0; i <= lastDateOfDataIndex; i++) {
    const startDateString = priceDateStrings[i]
    const endDate = DateTime.fromJSDate(dateFrom(startDateString)).plus(horizon).toJSDate()
    const lastDateString = formatDate(findClosestDate(priceDates, endDate))
    const lastDateIndex = priceDateStrings.findIndex(s => s === lastDateString)

    const pricesThisSimulation = {}
    priceDateStrings.slice(i, lastDateIndex + 1)
      .forEach(dateString => {
        pricesThisSimulation[dateString] = prices[dateString]
      })

    simulationResults.push(computeMarketValuesFunction(pricesThisSimulation))
  }
  return simulationResults
}

module.exports.runSlidingWindowSimulation = runSlidingWindowSimulation