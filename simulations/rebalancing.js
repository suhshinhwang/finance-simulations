const path = require("path")
const _ = require("lodash")
const { Duration, DateTime } = require("luxon")
const prices = require("../resource/converted/mergedPrices.json")
const { rebalancePortfolioFunction, initializePortfolioByEquityRatio, getEquityRatios } = require("../src/strategies/rebalance")
const { computeMarketValues } = require("../src/computeMarketValues")
const { dateFrom, formatDate } = require("../src/utils")
const { writeJsonToFile } = require("../src/file-utils")

const { runSlidingWindowSimulation } = require("../src/runSlidingWindowSimulation")

function getRebalancedValues({
  prices,
  equityRatio,
  ratioTolerance,
}) {
  const availableDateStrings = Object.keys(prices);

  const equityRatioByDate = _.zipObject(availableDateStrings, getEquityRatios(availableDateStrings, equityRatio))

  const investmentAmount = 1000;

  return computeMarketValues({
    prices,
    dollarChangeFunction: rebalancePortfolioFunction(equityRatioByDate, ratioTolerance),
    portfolioInitializationFunction: initializePortfolioByEquityRatio(investmentAmount, equityRatio)
  })
}

module.exports.getRebalancedValues = getRebalancedValues

// Sample frequency is n per year.
function underSampleMarketValues(sampleFrequency, simulationValues) {
  const samplePeriod = Duration.fromObject({ year: (1 / sampleFrequency) })

  const startDate = simulationValues[0].date
  const endDate = dateFrom(_.last(simulationValues).date)

  const output = []
  for (
    let currentDate = DateTime.fromJSDate(dateFrom(startDate));
    +dateFrom(currentDate) <= endDate;
    currentDate = currentDate.plus(samplePeriod)
  ) {
    const currentDateString = formatDate(currentDate)

    output.push(simulationValues[currentDateString])
  }
}

function simulateAndSaveResults({
  horizon,
  equityRatio,
  ratioTolerance,
  filename
}) {
  const underSampleFunction = (samples) => underSampleMarketValues(4, samples)
  const horizonDuration = Duration.fromObject({ years: horizon })

  const investmentStrategy = (prices) => getRebalancedValues({
    prices,
    equityRatio: equityRatio,
    ratioTolerance: ratioTolerance
  })
  const windowSimulationResults = runSlidingWindowSimulation(prices, horizonDuration, investmentStrategy)
  const simulationResults = windowSimulationResults.map(result => {
    const lastRebalancedValue = _.last(result)

    return {
      initial: {
        date: result[0].date,
        equityShares: result[0].equityShares,
        bondShares: result[0].bondShares,
        equityMarketValue: result[0].equityMarketValue,
        bondMarketValue: result[0].bondMarketValue
      },
      final: {
        date: lastRebalancedValue.date,
        equityShares: lastRebalancedValue.equityShares,
        bondShares: lastRebalancedValue.bondShares,
        equityMarketValue: lastRebalancedValue.equityMarketValue,
        bondMarketValue: lastRebalancedValue.bondMarketValue
      },
    }

  })
  const writePath = path.join("simulation_results", "rebalancing", `${filename}.json`)
  writeJsonToFile(simulationResults, writePath);
}

const HORIZON_IN_YEARS = 10

simulateAndSaveResults({
  horizon: HORIZON_IN_YEARS,
  equityRatio: 1,
  ratioTolerance: 1,
  filename: `${HORIZON_IN_YEARS}y-only_equity`
})

simulateAndSaveResults({
  horizon: HORIZON_IN_YEARS,
  equityRatio: 0.9,
  ratioTolerance: 1,
  filename: `${HORIZON_IN_YEARS}y-90p_equity-no-rebalance`
})

simulateAndSaveResults({
  horizon: HORIZON_IN_YEARS,
  equityRatio: 0.9,
  ratioTolerance: 0.01,
  filename: `${HORIZON_IN_YEARS}y-90p_equity`
})

simulateAndSaveResults({
  horizon: HORIZON_IN_YEARS,
  equityRatio: (y) => 1 - (y * 0.02),
  ratioTolerance: 1,
  filename: `${HORIZON_IN_YEARS}y-(1-0.02y)_equity`,
})