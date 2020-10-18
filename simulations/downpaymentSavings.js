
/**
 * - get prices
 * - invest the prices over a period of 3 years
 *  - use dollar cost averaging for 866 a month
 *  - assume that retirement ratio is at 90% equity
 *  => 10% of equity and DCA at 866 a month also
 *  => this means that equity would be 86.6/month for down payment
 * ? see what happens when there's more money that can be equity for down payment
 * - calculate how many of these prices performed worse than just regular savings at 1.5%
 */

const path = require("path")
const _ = require("lodash")
const { Duration } = require("luxon")
const prices = require("../resource/converted/mergedPrices.json")
const { rebalancePortfolioFunction } = require("../src/strategies/rebalance")
const { computeMarketValues } = require("../src/computeMarketValues")
const { writeJsonToFile } = require("../src/file-utils")

const { runSlidingWindowSimulation } = require("../src/runSlidingWindowSimulation")
const { dollarCostAveraging } = require("../src/strategies/dollarCostAveraging")
const { compositeInvestmentStrategy } = require("../src/strategies/compositeStrategies")

function getRebalancedAndDcaValues({
  prices,
  monthlyContribution,
  equityRatio,
  ratioTolerance,
  horizon
}) {
  const rebalanceStrategy = rebalancePortfolioFunction(equityRatio, ratioTolerance)
  // Due to the way DCA is implemented, it needs to be reset or else the "start date" is always wrong.
  const dollarCostAveragingStrategy = () => dollarCostAveraging(monthlyContribution, Duration.fromObject({ month: 1 }), equityRatio)

  const investmentStrategy = () => compositeInvestmentStrategy([rebalanceStrategy, dollarCostAveragingStrategy()])
  const initialInvestment = () => ({ equityDollars: 0, bondDollars: 0 })

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
      downPaymentEquityValue: lastDownPaymentValues.equityMarketValue,
      downPaymentBondValue: lastDownPaymentValues.bondMarketValue,
      retirementEquityValue: lastRetirementValues.equityMarketValue,
      retirementBondValue: lastRetirementValues.bondMarketValue,
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

  const writePath = path.join("simulation_results", "down_payment", `${filename}.json`)
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