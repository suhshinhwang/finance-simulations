const _ = require("lodash")

const identityValueFunction = (v) => v

function getMedian(array, valueFunction = identityValueFunction) {
  const sortedArray = _.sortBy(array, valueFunction)
  const length = sortedArray.length;

  if (length % 2 === 0) {
    const midUpper = length / 2;
    const midLower = midUpper - 1;

    return (valueFunction(sortedArray[midUpper]) + valueFunction(sortedArray[midLower])) / 2;
  } else {
    return valueFunction(sortedArray[Math.floor(length / 2)]);
  }
}

module.exports.getMedian = getMedian

function getQuartiles(array, valueFunction = identityValueFunction) {
  const sortedArray = _.sortBy(array, valueFunction)

  const median = getMedian(sortedArray, valueFunction)

  const firstQuartile = getMedian(sortedArray.slice(0, _.ceil(sortedArray.length / 2)), valueFunction);
  const thirdQuartile = getMedian(sortedArray.slice(_.floor(sortedArray.length / 2)), valueFunction);

  return {
    median,
    firstQuartile,
    thirdQuartile
  }
}

module.exports.getQuartiles = getQuartiles

function getStandardDeviation(array, valueFunction = identityValueFunction) {
  const average = _.sumBy(array, valueFunction) / array.length

  return Math.sqrt(_.sum(
    array.map(valueFunction).map(v => Math.pow(v - average, 2))
  ) / array.length)
}

module.exports.getStandardDeviation = getStandardDeviation