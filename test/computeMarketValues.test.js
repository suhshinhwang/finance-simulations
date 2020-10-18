const { computeMarketValues } = require("../src/computeMarketValues")

describe("computing market values", function () {
  it("should correctly compute market values given prices", function () {
    const prices = {
      "2000-01-01": {
        "open": {
          "equity": 100,
          "bond": 100
        },
        "close": {
          "equity": 200,
          "bond": 200
        }
      },
      "2000-01-02": {
        "open": {
          "equity": 200,
          "bond": 200
        },
        "close": {
          "equity": 300,
          "bond": 300
        }
      },
      "2001-01-02": {
        "open": {
          "equity": 150,
          "bond": 300
        },
        "close": {
          "equity": 450,
          "bond": 600
        }
      },
    }

    const values = computeMarketValues({
      prices,
      dollarChangeFunction: () => ({ equityDollarChange: 0, bondDollarChange: 0 }),
      portfolioInitializationFunction: () => ({ equityDollars: 200, bondDollars: 200 })
    })

    expect(values).toHaveLength(3)

    expect(values[0].date).toEqual("2000-01-01")
    expect(values[0].equityShares).toBeCloseTo(1, 4)
    expect(values[0].bondShares).toBeCloseTo(1, 4)
    expect(values[0].equityMarketValue).toBeCloseTo(200, 4)
    expect(values[0].bondMarketValue).toBeCloseTo(200, 4)
    expect(values[0].ratio).toBeCloseTo(0.5, 4)

    expect(values[1].date).toEqual("2000-01-02")
    expect(values[1].equityShares).toBeCloseTo(1, 4)
    expect(values[1].bondShares).toBeCloseTo(1, 4)
    expect(values[1].equityMarketValue).toBeCloseTo(300, 4)
    expect(values[1].bondMarketValue).toBeCloseTo(300, 4)
    expect(values[1].ratio).toBeCloseTo(0.5, 4)

    expect(values[2].date).toEqual("2001-01-02")
    expect(values[2].equityShares).toBeCloseTo(1, 4)
    expect(values[2].bondShares).toBeCloseTo(1, 4)
    expect(values[2].equityMarketValue).toBeCloseTo(450, 4)
    expect(values[2].bondMarketValue).toBeCloseTo(600, 4)
    expect(values[2].ratio).toBeCloseTo(0.42857, 4)
  })
})