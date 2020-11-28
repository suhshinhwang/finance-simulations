/**
 * This simulation answers the question: what is the result if I put 90% bonds and 10% in stocks for my down payment?
 * How much better or worse would it perform compared to a savings with 2% interest rate, compounded monthly for the same
 * period.
 */

import * as path from "path"
import * as _ from "lodash"
import { Duration } from "luxon"
import * as prices from "../resource/converted/mergedPrices.json"
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
  equityRatio,
  ratioTolerance,
  horizon
}: {
  prices: OpenClosePriceByFundByDate,
  monthlyContribution: number,
  equityRatio: number,
  ratioTolerance: number,
  horizon: Duration
}) {
  const priceDates = Object.keys(prices)
  const ratioByFund: RatioByFund = { "equity": equityRatio, "bond": 1 - equityRatio }
  const equityRatiosByFundByDate: RatioByFundByDate = getEquityRatiosByFundByDate(priceDates, ratioByFund)
  const rebalanceStrategy = rebalancePortfolioFunction(equityRatiosByFundByDate, ratioTolerance)
  // Due to the way DCA is implemented, it needs to be reset or else the "start date" is always wrong.
  const dollarCostAveragingStrategy = () => dollarCostAveraging(monthlyContribution, Duration.fromObject({ month: 1 }), ratioByFund)

  const investmentStrategy = () => compositeInvestmentStrategy([rebalanceStrategy, dollarCostAveragingStrategy()])
  const initialInvestment = () => ({ equity: 0, bond: 0 })

  const marketValueFunction = (prices) => computeMarketValues({
    prices,
    dollarChangeFunction: investmentStrategy(),
    portfolioInitializationFunction: initialInvestment
  })

  return runSlidingWindowSimulation(prices, horizon, marketValueFunction)
}

function simulateResults({
  horizon,
  savingsInterest,
  downPaymentMonthlyContribution,
  downPaymentEquityRatio,
  retirementMonthlyContribution,
  retirementEquityRatio,
  compoundsPerYear = 12,
  filename,
}: {
  horizon: Duration,
  savingsInterest: number,
  downPaymentMonthlyContribution: number,
  downPaymentEquityRatio: number,
  retirementMonthlyContribution: number,
  retirementEquityRatio: number,
  compoundsPerYear?: number,
  filename: string,
}) {
  if (downPaymentEquityRatio > 1 || downPaymentEquityRatio < 0) {
    throw new Error(`down payment equity ratio invalid; it is '${downPaymentEquityRatio}`)
  }

  // array of prices => number[][]
  const downPaymentSimulationResults = getRebalancedAndDcaValues({
    prices,
    monthlyContribution: downPaymentMonthlyContribution,
    equityRatio: downPaymentEquityRatio,
    ratioTolerance: 0.01,
    horizon
  })

  const retirementSimulationResults = getRebalancedAndDcaValues({
    prices,
    monthlyContribution: retirementMonthlyContribution,
    equityRatio: retirementEquityRatio,
    ratioTolerance: 0.01,
    horizon
  })

  const simulationResults = _.zipWith(downPaymentSimulationResults, retirementSimulationResults, function (downPayment, retirement) {
    const lastDownPaymentValues = _.last(downPayment)
    const lastRetirementValues = _.last(retirement)

    if (downPayment[0].date !== retirement[0].date || lastDownPaymentValues.date !== lastRetirementValues.date) {
      throw new Error("Dates don't match!")
    }

    return {
      startDate: downPayment[0].date,
      endDate: lastDownPaymentValues.date,
      downPaymentEquityValue: lastDownPaymentValues.marketValues.equity,
      downPaymentBondValue: lastDownPaymentValues.marketValues.bond,
      retirementEquityValue: lastRetirementValues.marketValues.equity,
      retirementBondValue: lastRetirementValues.marketValues.bond,
    }
  })

  // Money if this amount was simply left in savings
  const savingsByYear = new Array(horizon.as("years") * compoundsPerYear).fill(downPaymentMonthlyContribution * 12 / compoundsPerYear)
  const savingsBalance = _.reduce(savingsByYear, (cumulated, contribution) => {
    return cumulated * (1 + (savingsInterest / compoundsPerYear)) + contribution
  }, 0)

  const fileContent = {
    savingsBalance,
    downPaymentEquityRatio,
    simulationCondition: {
      horizonInYears: horizon.as("years"),
      savingsInterest,
      downPaymentMonthlyContribution,
      downPaymentEquityRatio,
      retirementMonthlyContribution,
      retirementEquityRatio,
      compoundsPerYear,
    },
    simulationResults
  }

  const writePath = path.join("simulation_results", "down_payment", `${filename}-validate.json`)
  writeJsonToFile(fileContent, writePath)
}

const HORIZON_IN_YEARS = Duration.fromObject({ years: 3 })

simulateResults({
  horizon: HORIZON_IN_YEARS,
  downPaymentMonthlyContribution: 1000,
  downPaymentEquityRatio: 0.1,
  retirementMonthlyContribution: 1000,
  retirementEquityRatio: 0.9,
  savingsInterest: 0.02,
  filename: "r1k-d1k-0_9-2pSavings-3y"
})

simulateResults({
  horizon: Duration.fromObject({ years: 5 }),
  downPaymentMonthlyContribution: 1000,
  downPaymentEquityRatio: 0.1,
  retirementMonthlyContribution: 1000,
  retirementEquityRatio: 0.9,
  savingsInterest: 0.02,
  filename: "r1k-d1k-0_9-2pSavings-5y"
})