const { whenInvestmentBetterThanProjection } = require("../src/investmentHorizon")
const { Duration } = require("luxon")

describe("finding when investment is better than projection", function () {
  test("should return the correct result when at horizon, the investment performs better than projection", () => {
    const marketValues = [
      {
        date: "2000-01-01",
        equityMarketValue: 10,
        bondMarketValue: 10
      },
      {
        date: "2001-01-01",
        equityMarketValue: 20,
        bondMarketValue: 20
      }
    ]

    expect(whenInvestmentBetterThanProjection({
      marketValues,
      horizon: Duration.fromObject({ years: 1 }),
      withdrawalFlexibilityDuration: Duration.fromObject({ years: 1 }),
      expectedGrowthRate: 0.05
    })).toEqual({
      betterThanProjected: true,
      extraDaysToWait: 0,
      bondValue: 20,
      equityValue: 20
    })
  })

  test("should return the max price when after horizon, but during flexible duration, the investment performs better than projection", () => {
    const marketValues = [
      {
        date: "2000-01-01",
        equityMarketValue: 10,
        bondMarketValue: 10
      },
      {
        date: "2001-01-01",
        equityMarketValue: 10.4,
        bondMarketValue: 10.4
      },
      {
        date: "2001-01-31",
        equityMarketValue: 10.6,
        bondMarketValue: 10.6
      },
      {
        date: "2001-03-31",
        equityMarketValue: 10.3,
        bondMarketValue: 10.3
      },
      {
        date: "2001-05-31",
        equityMarketValue: 10.4,
        bondMarketValue: 10.4
      }
    ]

    expect(whenInvestmentBetterThanProjection({
      marketValues,
      horizon: Duration.fromObject({ years: 1 }),
      withdrawalFlexibilityDuration: Duration.fromObject({ years: 1 }),
      expectedGrowthRate: 0.05
    })).toEqual({
      betterThanProjected: true,
      extraDaysToWait: 30,
      bondValue: 10.6,
      equityValue: 10.6
    })
  })

  test("should return the max price when the investment performs worse than projection after projection and after flexible duration", () => {
    const marketValues = [
      {
        date: "2000-01-01",
        equityMarketValue: 10,
        bondMarketValue: 10
      },
      {
        date: "2001-01-01",
        equityMarketValue: 10.4,
        bondMarketValue: 10.4
      },
      {
        date: "2001-01-31",
        equityMarketValue: 10.6,
        bondMarketValue: 10.6
      },
      {
        date: "2001-03-31",
        equityMarketValue: 10.7,
        bondMarketValue: 10.7
      },
      {
        date: "2001-05-31",
        equityMarketValue: 10.0,
        bondMarketValue: 10.0
      }
    ]

    expect(whenInvestmentBetterThanProjection({
      marketValues,
      horizon: Duration.fromObject({ years: 1 }),
      withdrawalFlexibilityDuration: Duration.fromObject({ years: 1 }),
      expectedGrowthRate: 0.1
    })).toEqual({
      betterThanProjected: false,
      extraDaysToWait: 89,
      bondValue: 10.7,
      equityValue: 10.7
    })
  })
})