const _ = require("lodash")
const { Duration } = require("luxon")
const { runSlidingWindowSimulation } = require("../src/runSlidingWindowSimulation")

describe("Running sliding window simulation", function () {
  const prices = {
    "2000-01-01": 1,
    "2000-01-10": 2,
    "2000-01-20": 3,
    "2000-01-30": 4,
    "2000-02-01": 5,
    "2000-02-10": 6,
    "2000-02-20": 7,
    "2000-03-01": 8,
  }

  it("should slide through the defined window (horizon)", function () {
    { // 1 week horizon
      const results = runSlidingWindowSimulation(prices, Duration.fromObject({ week: 1 }), identityMarketValueFunction)

      expect(results).toHaveLength(7)
      expect(results).toStrictEqual([
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5, 6], // 1 week away from Jan-30 is closer to Feb-10 than Feb-1
        [5, 6],
        [6, 7],
        [7, 8],
      ])
    }
    { // 1 month horizon
      const results = runSlidingWindowSimulation(prices, Duration.fromObject({ month: 1 }), identityMarketValueFunction)

      expect(results).toHaveLength(5)
      expect(results).toStrictEqual([
        [1, 2, 3, 4, 5],
        [2, 3, 4, 5, 6],
        [3, 4, 5, 6, 7],
        [4, 5, 6, 7, 8],
        [5, 6, 7, 8]
      ])
    }

  })

  it("should compute just one window when the horizon is greater than data set", function () {
    const results = runSlidingWindowSimulation(prices, Duration.fromObject({ year: 1 }), identityMarketValueFunction)

    expect(results).toHaveLength(1)
    expect(results).toStrictEqual([
      [1, 2, 3, 4, 5, 6, 7, 8],
    ])
  })

  function identityMarketValueFunction(prices) {
    return _.keys(prices).map(key => prices[key])
  }
})