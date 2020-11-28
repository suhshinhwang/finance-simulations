/**
 * This simulation compares just SP500+bond vs SP500+NASDAQ+DJIA+bond
 */

import * as path from "path"
import * as _ from "lodash"
import { Duration } from "luxon"
import * as portfolioPrices from "../resource/converted/portfolioPrices.json"
import * as simplifiedPrices from "../resource/converted/mergedPrices.json"
import { rebalancePortfolioFunction, RatioByFundByDate, getEquityRatiosByFundByDate } from "../src/strategies/rebalance"
import { computeMarketValues } from "../src/computeMarketValues"
import { writeJsonToFile } from "../src/file-utils"

import { runSlidingWindowSimulation } from "../src/runSlidingWindowSimulation"
import { dollarCostAveraging } from "../src/strategies/dollarCostAveraging"
import { compositeInvestmentStrategy } from "../src/strategies/compositeStrategies"
import { OpenClosePriceByFundByDate, RatioByFund, } from "src/types"

function getRebalancedAndDcaValues({
  prices,
  monthlyContribution,
  ratioByFund,
  ratioTolerance,
  horizon
}: {
  prices: OpenClosePriceByFundByDate,
  monthlyContribution: number,
  ratioByFund: RatioByFund,
  ratioTolerance: number,
  horizon: Duration
}) {
  const priceDates = Object.keys(prices)
  const equityRatiosByFundByDate: RatioByFundByDate = getEquityRatiosByFundByDate(priceDates, ratioByFund)
  const rebalanceStrategy = rebalancePortfolioFunction(equityRatiosByFundByDate, ratioTolerance)
  // Due to the way DCA is implemented, it needs to be reset or else the "start date" is always wrong.
  const dollarCostAveragingStrategy = () => dollarCostAveraging(monthlyContribution, Duration.fromObject({ month: 1 }), ratioByFund)

  const investmentStrategy = () => compositeInvestmentStrategy([rebalanceStrategy, dollarCostAveragingStrategy()])
  const fundAmounts = _.keys(ratioByFund).length
  const initialInvestment = () => _.reduce(ratioByFund, (initial, __, fund) => {
    initial[fund] = 0

    return initial
  }, {})

  const marketValueFunction = (prices: OpenClosePriceByFundByDate) => {
    const lastSimulationResult = _.last(computeMarketValues({
      prices,
      dollarChangeFunction: investmentStrategy(),
      portfolioInitializationFunction: initialInvestment
    }))

    return {
      startDate: _.keys(prices)[0],
      endDate: lastSimulationResult.date,
      marketValues: lastSimulationResult.marketValues,
      shares: lastSimulationResult.shares
    }
  }

  return runSlidingWindowSimulation(prices, horizon, marketValueFunction)
}

function simulateResults({
  prices,
  horizon,
  monthlyContribution,
  ratioByFund,
  filename,
}: {
  prices: OpenClosePriceByFundByDate,
  horizon: Duration,
  monthlyContribution: number,
  ratioByFund: RatioByFund,
  filename: string,
}) {
  const windowSimulationResults = getRebalancedAndDcaValues({
    prices,
    monthlyContribution: monthlyContribution,
    ratioByFund: ratioByFund,
    ratioTolerance: 0.01,
    horizon
  })

  const fileContent = {
    simulationCondition: {
      horizonInYears: horizon.as("years"),
      monthlyContribution,
      ratioByFund,
    },
    simulationResults: windowSimulationResults
  }

  const writePath = path.join("simulation_results", "dca_rebalance", `${filename}.json`)
  writeJsonToFile(fileContent, writePath)
}

const equityRatio = 0.9
const horizon = Duration.fromObject({ years: 10 })

// simulateResults({
//   prices: portfolioPrices,
//   horizon,
//   monthlyContribution: 1000,
//   ratioByFund: {
//     "900": equityRatio / 4,
//     "903": equityRatio / 4,
//     "908": equityRatio / 4,
//     "902": equityRatio / 4,
//     "909": 1 - equityRatio
//   },
//   filename: "10-year-sp500-nasdaq-djia"
// })

simulateResults({
  prices: simplifiedPrices,
  horizon,
  monthlyContribution: 1000,
  ratioByFund: {
    "equity": equityRatio,
    "bond": 1 - equityRatio
  },
  filename: "10-year-simplified"
})