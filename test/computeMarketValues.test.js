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
      dollarChangeFunction: () => ({ equity: 0, bond: 0 }),
      portfolioInitializationFunction: () => ({ equity: 200, bond: 200 })
    })

    expect(values).toHaveLength(3)

    expect(values[0].date).toEqual("2000-01-01")
    expect(values[0].shares.equity).toBeCloseTo(1, 4)
    expect(values[0].shares.bond).toBeCloseTo(1, 4)
    expect(values[0].marketValues.equity).toBeCloseTo(200, 4)
    expect(values[0].marketValues.bond).toBeCloseTo(200, 4)

    expect(values[1].date).toEqual("2000-01-02")
    expect(values[1].shares.equity).toBeCloseTo(1, 4)
    expect(values[1].shares.bond).toBeCloseTo(1, 4)
    expect(values[1].marketValues.equity).toBeCloseTo(300, 4)
    expect(values[1].marketValues.bond).toBeCloseTo(300, 4)

    expect(values[2].date).toEqual("2001-01-02")
    expect(values[2].shares.equity).toBeCloseTo(1, 4)
    expect(values[2].shares.bond).toBeCloseTo(1, 4)
    expect(values[2].marketValues.equity).toBeCloseTo(450, 4)
    expect(values[2].marketValues.bond).toBeCloseTo(600, 4)
  })
})