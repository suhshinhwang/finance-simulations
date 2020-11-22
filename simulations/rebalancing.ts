import * as path from "path"
import * as _ from "lodash"
import { Duration, DateTime } from "luxon"
import * as mergedPrices from "../resource/converted/mergedPrices.json"
import { rebalancePortfolioFunction, initializePortfolioByEquityRatio, getEquityRatios, RatioByFund } from "../src/strategies/rebalance"
import { computeMarketValues } from "../src/computeMarketValues"
import { dateFrom, formatDate, log } from "../src/utils"
import { writeJsonToFile } from "../src/file-utils"

import { runSlidingWindowSimulation } from "../src/runSlidingWindowSimulation"
import { OpenClosePriceByFundByDate } from "src/types"

function getRebalancedValues({
  prices,
  equityRatio,
  ratioTolerance,
}: {
  prices: OpenClosePriceByFundByDate,
  equityRatio: RatioByFund,
  ratioTolerance: number
}) {
  const availableDateStrings = Object.keys(prices);
  const equityRatios = getEquityRatios(availableDateStrings, equityRatio)

  const equityRatioByDate = _.zipObject(availableDateStrings, equityRatios)

  const investmentAmount = 1000;

  return computeMarketValues({
    prices,
    dollarChangeFunction: rebalancePortfolioFunction(equityRatioByDate, ratioTolerance),
    portfolioInitializationFunction: initializePortfolioByEquityRatio(investmentAmount, equityRatio)
  })
}

function simulateAndSaveResults({
  horizon,
  equityRatio,
  ratioTolerance,
  filename
}) {
  const horizonDuration = Duration.fromObject({ years: horizon })

  const investmentStrategy = (prices: OpenClosePriceByFundByDate) => getRebalancedValues({
    prices,
    equityRatio: { "equity": equityRatio, "bond": 1 - equityRatio },
    ratioTolerance: ratioTolerance
  })

  const windowSimulationResults = runSlidingWindowSimulation(mergedPrices, horizonDuration, investmentStrategy)
  const simulationResults = windowSimulationResults.map(result => {
    const lastRebalancedValue = _.last(result)

    return {
      initial: {
        date: result[0].date,
        shares: result[0].shares,
        marketValues: result[0].marketValues,
      },
      final: {
        date: lastRebalancedValue.date,
        shares: lastRebalancedValue.shares,
        marketValues: lastRebalancedValue.marketValues,
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