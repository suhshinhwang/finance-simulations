const _ = require("lodash")
const path = require("path")

const onlyEquity = require("../../simulation_results/rebalancing/10y-only_equity.json")
const equity90p = require("../../simulation_results/rebalancing/10y-90p_equity.json")
const equity90pNoRebalance = require("../../simulation_results/rebalancing/10y-90p_equity-no-rebalance.json")
const equityWith2pFunction = require("../../simulation_results/rebalancing/10y-(1-0.02y)_equity.json")

const { writeJsonToFile } = require("../../src/file-utils")

function getTotalMarketValue(prices) {
  return prices.final.equityMarketValue + prices.final.bondMarketValue
}

function getBoxPlotValues(array) {

  function getMedian(array) {
    const length = array.length;

    if (length % 2 === 0) {
      const midUpper = length / 2;
      const midLower = midUpper - 1;

      return (array[midUpper] + array[midLower]) / 2;
    } else {
      return array[Math.floor(length / 2)];
    }
  }

  const sortedArray = _.sortBy(array, getTotalMarketValue)

  const max = _.last(sortedArray);
  const min = sortedArray[0];
  const median = getMedian(sortedArray);

  // First Quartile is the median from lowest to overall median.
  const firstQuartile = getMedian(sortedArray.slice(0, _.ceil(sortedArray.length / 2)));

  // Third Quartile is the median from the overall median to the highest.
  const thirdQuartile = getMedian(sortedArray.slice(_.floor(sortedArray.length / 2)));

  const average = _.sumBy(sortedArray, getTotalMarketValue) / sortedArray.length

  const standardDeviation = Math.sqrt(_.sum(
    sortedArray.map(getTotalMarketValue).map(v => Math.pow(v - average, 2))
  ) / sortedArray.length)


  return {
    min,
    max,
    median: getTotalMarketValue(median),
    firstQuartile: getTotalMarketValue(firstQuartile),
    thirdQuartile: getTotalMarketValue(thirdQuartile),
    average,
    totalMarketValueStdDev: standardDeviation
  }
}

const output = {
  onlyEquity: {
    boxPlotValues: getBoxPlotValues(onlyEquity)
  },
  equity90percent: {
    boxPlotValues: getBoxPlotValues(equity90p)
  },
  equityWith2pFunction: {
    boxPlotValues: getBoxPlotValues(equityWith2pFunction)
  },
  equity90percentNoRebalance: {
    boxPlotValues: getBoxPlotValues(equity90pNoRebalance)
  }
}

const outputPath = path.join("analysis", "rebalancing", "rebalancing-effects.json")
writeJsonToFile(output, outputPath)
