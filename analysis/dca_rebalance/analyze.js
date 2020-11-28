const _ = require("lodash")
const path = require("path")
const myPortfolio = require("../../simulation_results/dca_rebalance/10-year-sp500-nasdaq-djia.json")
const simplifiedPortfolio = require("../../simulation_results/dca_rebalance/10-year-simplified.json")
const { writeJsonToFile } = require("../../src/file-utils")
const { histogram } = require("../statistics")

const { getQuartiles, getStandardDeviation } = require("../statistics")


function simplifiedTotalValueFunction(result) {
  const { marketValues } = result
  return marketValues.equity + marketValues.bond
}

function portfolioTotalValueFunction(result) {
  const { marketValues } = result
  return marketValues['900'] + marketValues['902'] + marketValues['903'] + marketValues['908'] + marketValues['909']
}


function analyzeResults(results, portfolioValueFunction) {
  const { simulationResults } = results;
  const values = simulationResults.map(portfolioValueFunction)

  const analysis = {
    conditions: results.simulationCondition,
    stats: {
      ...getQuartiles(simulationResults, portfolioValueFunction),
      min: _.minBy(simulationResults, portfolioValueFunction),
      max: _.maxBy(simulationResults, portfolioValueFunction),
      stdDev: getStandardDeviation(simulationResults, portfolioValueFunction),
      histogram: histogram(values, 10)
    }
  }

  return analysis
}

const myPortfolioAnalysis = analyzeResults(myPortfolio, portfolioTotalValueFunction)
const simplifiedPortfolioAnalysis = analyzeResults(simplifiedPortfolio, simplifiedTotalValueFunction)

const analysisResult = {
  myPortfolioAnalysis,
  simplifiedPortfolioAnalysis
}
const outputPath = path.join("analysis", "dca_rebalance", "analysis.json")
writeJsonToFile(analysisResult, outputPath)
