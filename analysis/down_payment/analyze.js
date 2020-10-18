const _ = require("lodash")
const path = require("path")
const r1 = require("../../simulation_results/down_payment/r1k-d1k-0_9-2pSavings-3y.json")
const r2 = require("../../simulation_results/down_payment/r1k-d1k-0_9-2pSavings-5y.json")
const { writeJsonToFile } = require("../../src/file-utils")

const { getQuartiles, getStandardDeviation } = require("../statistics")


function analyzeResults(results) {
  const { simulationResults } = results;

  const betterResults = simulationResults.filter(result => (result.downPaymentEquityValue + result.downPaymentBondValue) >= results.savingsBalance)
    .map(betterResult => {
      const surplus = (betterResult.downPaymentBondValue + betterResult.downPaymentEquityValue) - results.savingsBalance

      return {
        startDate: betterResult.startDate,
        endDate: betterResult.endDate,
        surplus,
        downPaymentBondValue: betterResult.downPaymentBondValue,
        downPaymentEquityValue: betterResult.downPaymentEquityValue
      }
    })

  const worseResults = simulationResults.filter(result => (result.downPaymentEquityValue + result.downPaymentBondValue) < results.savingsBalance)
    .map(poorResult => {
      const unmetAmount = results.savingsBalance - (poorResult.downPaymentBondValue + poorResult.downPaymentEquityValue)
      const raidedRetirementBondValue = poorResult.retirementBondValue - unmetAmount

      return {
        startDate: poorResult.startDate,
        endDate: poorResult.endDate,
        unmetAmount,
        downPaymentBondValue: poorResult.downPaymentBondValue,
        downPaymentEquityValue: poorResult.downPaymentEquityValue,
        retirementBondValue: raidedRetirementBondValue,
        retirementEquityValue: poorResult.retirementEquityValue,
        equityRatio: poorResult.retirementEquityValue / (poorResult.retirementEquityValue + raidedRetirementBondValue)
      }
    })

  function unmetValueFunction(result) {
    return result.unmetAmount
  }

  function totalDownPaymentFunction(result) {
    return result.surplus
  }

  const analysis = {
    conditions: results.simulationCondition,
    savingsBalance: results.savingsBalance,
    worseThanSavings: {
      ...getQuartiles(worseResults, unmetValueFunction),
      min: _.minBy(worseResults, unmetValueFunction),
      max: _.maxBy(worseResults, unmetValueFunction),
      stdDev: getStandardDeviation(worseResults, unmetValueFunction),
    },
    betterThanSavings: {
      ...getQuartiles(betterResults, totalDownPaymentFunction),
      min: _.minBy(betterResults, totalDownPaymentFunction),
      max: _.maxBy(betterResults, totalDownPaymentFunction),
      stdDev: getStandardDeviation(betterResults, totalDownPaymentFunction),
    },
    worseResultCount: worseResults.length,
    totalDataPoints: simulationResults.length,
    poorResultPercentage: worseResults.length / simulationResults.length * 100
  }

  return analysis
}

const analysisResults = [r1, r2].map(analyzeResults)

const outputPath = path.join("analysis", "down_payment", "analysis.json")
writeJsonToFile(analysisResults, outputPath)
