const { getEquityRatios, getAnnualEquityRatio, rebalancePortfolioFunction } = require("../../src/strategies/rebalance")

describe("generating annual equity ratios", function () {
  test("should generate correct number of ratios given fixed number and prices", () => {
    expect(getAnnualEquityRatio(0, 0.75)).toEqual([])
    expect(getAnnualEquityRatio(1, 0.75)).toEqual([0.75])
    expect(getAnnualEquityRatio(2, 0.75)).toEqual([0.75, 0.75])
  })

  test("should generate the correct ratios when given a function", () => {
    expect(getAnnualEquityRatio(0, () => 0.5)).toEqual([])
    expect(getAnnualEquityRatio(1, () => 0.5)).toEqual([0.5])
    expect(getAnnualEquityRatio(2, () => 0.5)).toEqual([0.5, 0.5])

    expect(getAnnualEquityRatio(0, (y) => 1 - y / 10)).toEqual([])
    expect(getAnnualEquityRatio(2, (y) => 1 - y / 10)).toEqual([1, 0.9])
    expect(getAnnualEquityRatio(3, (y) => 1 - y / 10)).toEqual([1, 0.9, 0.8])
  })
})

describe("generating equity ratios by giving date strings", function () {
  it("should generate the correct equity ratios when given fixed numbers", () => {
    {
      expect(getEquityRatios([], 0.75)).toEqual([])
    }
    {
      const dates = ["2000-01-01"]
      expect(getEquityRatios(dates, 0.75)).toEqual([0.75])
    }
    {
      const dates = ["2000-01-01", "2000-01-02", "2000-02-01"]
      expect(getEquityRatios(dates, 0.75)).toEqual([0.75, 0.75, 0.75])
    }
    {
      const dates = ["2000-01-01", "2000-01-02", "2001-02-01"]
      expect(getEquityRatios(dates, 0.75)).toEqual([0.75, 0.75, 0.75])
    }
  })

  it("should generate correct ratios when given a function", () => {
    const equityRatioFunction = y => 1 - (y / 10)
    {
      expect(getEquityRatios([], equityRatioFunction)).toEqual([])
    }
    {
      const dates = ["2000-01-01"]
      expect(getEquityRatios(dates, equityRatioFunction)).toEqual([1])
    }
    {
      const dates = ["2000-01-01", "2000-01-02", "2000-02-01"]
      expect(getEquityRatios(dates, equityRatioFunction)).toEqual([1, 1, 1])
    }
    {
      const dates = ["2000-01-01", "2000-01-02", "2001-02-01", "2001-07-31"]
      expect(getEquityRatios(dates, equityRatioFunction)).toEqual([1, 1, 0.9, 0.9])
    }
  })
})

describe("rebalance portfolio function", function () {
  it("should rebalance the portfolio, if the opening prices cause the portfolio to be out of ratio", function () {
    const equityRatioByDate = {
      "2000-01-01": 0.75
    }
    const rebalancingFunction = rebalancePortfolioFunction(equityRatioByDate, 0.0)

    const dollarsToMove = rebalancingFunction({
      previousDayPortfolio: {
        equityShares: 2,
        bondShares: 2
      },
      bondOpeningPrice: 50,
      equityOpeningPrice: 50,
      todayDateString: "2000-01-01"
    })

    expect(dollarsToMove).toEqual({
      equityDollarChange: 50,
      bondDollarChange: -50
    })
  })

  it("should not rebalance the portfolio if the portfolio is within balance", function () {
    const equityRatioByDate = {
      "2000-01-01": 0.75
    }
    const rebalancingFunction = rebalancePortfolioFunction(equityRatioByDate, 0.25)

    const dollarsToMove = rebalancingFunction({
      previousDayPortfolio: {
        equityShares: 2.5,
        bondShares: 1.5
      },
      bondOpeningPrice: 50,
      equityOpeningPrice: 50,
      todayDateString: "2000-01-01"
    })

    expect(dollarsToMove.equityDollarChange).toBeCloseTo(0, 4)
    expect(dollarsToMove.bondDollarChange).toBeCloseTo(0, 4)
  })
})