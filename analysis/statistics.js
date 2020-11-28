const _ = require("lodash")

const { log } = require("../src/utils")

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

function getCorrelation(vector1, vector2) {
  if (vector1.length != vector2.length) {
    throw new Error("vector lengths not equivalent")
  }
  const v1Avg = _.sum(vector1) / vector1.length
  const v2Avg = _.sum(vector2) / vector2.length

  const v1StdDev = getStandardDeviation(vector1)
  const v2StdDev = getStandardDeviation(vector2)

  const dataPairs = _.zip(vector1, vector2)

  return _.sum(dataPairs.map(data => (data[0] - v1Avg) * (data[1] - v2Avg))) / (v1StdDev * v2StdDev * vector1.length)
}

module.exports.getCorrelation = getCorrelation

function histogram(vector, buckets) {
  const min = _.min(vector)
  const max = _.max(vector)

  const range = max - min
  const bucketSize = range / buckets

  return _.reduce(vector, (histogram, value) => {
    const bucketCounts = _.floor((value - min) / bucketSize)
    const bucket = min + bucketCounts * bucketSize
    if (histogram[bucket] == null) {
      histogram[bucket] = 0
    }
    histogram[bucket]++;
    return histogram
  }, {})
}

module.exports.histogram = histogram