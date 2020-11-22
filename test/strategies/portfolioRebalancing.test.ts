import { getEquityRatios, getAnnualEquityRatio, rebalancePortfolioFunction } from "../../src/strategies/rebalance"

describe("generating annual equity ratios", function () {
  test("should generate correct number of ratios given fixed number and prices", () => {
    expect(getAnnualEquityRatio(0, { "equity": 0.75, "bond": 0.25 })).toEqual([])
    expect(getAnnualEquityRatio(1, { "equity": 0.75, "bond": 0.25 })).toEqual([{ "equity": 0.75, "bond": 0.25 }])
    expect(getAnnualEquityRatio(2, { "equity": 0.75, "bond": 0.25 })).toEqual([{ "equity": 0.75, "bond": 0.25 }, { "equity": 0.75, "bond": 0.25 }])
  })

  test("should generate the correct ratios when given a function", () => {
    expect(getAnnualEquityRatio(0, () => ({ "equity": 0.75, "bond": 0.25 }))).toEqual([])
    expect(getAnnualEquityRatio(1, () => ({ "equity": 0.75, "bond": 0.25 }))).toEqual([{ "equity": 0.75, "bond": 0.25 }])
    expect(getAnnualEquityRatio(2, () => ({ "equity": 0.75, "bond": 0.25 }))).toEqual([{ "equity": 0.75, "bond": 0.25 }, { "equity": 0.75, "bond": 0.25 }])

    expect(getAnnualEquityRatio(0, (y) => ({ "equity": 1 - y / 10 }))).toEqual([])
    expect(getAnnualEquityRatio(2, (y) => ({ "equity": 1 - y / 10 }))).toEqual([{ "equity": 1 }, { "equity": 0.9 }])
    expect(getAnnualEquityRatio(3, (y) => ({ "equity": 1 - y / 10 }))).toEqual([{ "equity": 1 }, { "equity": 0.9 }, { "equity": 0.8 }])
  })
})

describe("generating equity ratios by giving date strings", function () {
  it("should generate the correct equity ratios when given fixed numbers", () => {
    {
      expect(getEquityRatios([], { "equity": 0.75, "bond": 0.25 })).toEqual([])
    }
    {
      const dates = ["2000-01-01"]
      expect(getEquityRatios(dates, { "equity": 0.75, "bond": 0.25 })).toEqual([{ "equity": 0.75, "bond": 0.25 }])
    }
    {
      const dates = ["2000-01-01", "2000-01-02", "2000-02-01"]
      expect(getEquityRatios(dates, { "equity": 0.75, "bond": 0.25 })).toEqual([{ "equity": 0.75, "bond": 0.25 }, { "equity": 0.75, "bond": 0.25 }, { "equity": 0.75, "bond": 0.25 }])
    }
    {
      const dates = ["2000-01-01", "2000-01-02", "2001-02-01"]
      expect(getEquityRatios(dates, { "equity": 0.75, "bond": 0.25 })).toEqual([{ "equity": 0.75, "bond": 0.25 }, { "equity": 0.75, "bond": 0.25 }, { "equity": 0.75, "bond": 0.25 }])
    }
    {
      const dates = ["2000-01-01", "2000-01-02", "2001-12-01", "2002-01-01", "2002-12-01"]
      expect(getEquityRatios(dates, { "equity": 0.75, "bond": 0.25 })).toEqual([
        { "equity": 0.75, "bond": 0.25 },
        { "equity": 0.75, "bond": 0.25 },
        { "equity": 0.75, "bond": 0.25 },
        { "equity": 0.75, "bond": 0.25 },
        { "equity": 0.75, "bond": 0.25 }
      ])
    }
    {
      const dates = [
        "2001-10-01",
        "2001-11-02",
        "2002-09-01",
      ]
      expect(getEquityRatios(dates, { "equity": 0.75, "bond": 0.25 })).toEqual([
        { "equity": 0.75, "bond": 0.25 },
        { "equity": 0.75, "bond": 0.25 },
        { "equity": 0.75, "bond": 0.25 },
      ])
    }
  })

  it("should generate correct ratios when given a function", () => {
    const equityRatioFunction = y => ({ "equity": 1 - y / 10 })
    {
      expect(getEquityRatios([], equityRatioFunction)).toEqual([])
    }
    {
      const dates = ["2000-01-01"]
      expect(getEquityRatios(dates, equityRatioFunction)).toEqual([{ "equity": 1 }])
    }
    {
      const dates = ["2000-01-01", "2000-01-02", "2000-02-01"]
      expect(getEquityRatios(dates, equityRatioFunction)).toEqual([{ "equity": 1 }, { "equity": 1 }, { "equity": 1 }])
    }
    {
      const dates = ["2000-01-01", "2000-01-02", "2001-02-01", "2001-07-31"]
      expect(getEquityRatios(dates, equityRatioFunction)).toEqual([{ "equity": 1 }, { "equity": 1 }, { "equity": 0.9 }, { "equity": 0.9 }])
    }
  })
})

describe("rebalance portfolio function", function () {
  it("should rebalance the portfolio, if the opening prices cause the portfolio to be out of ratio", function () {
    const equityRatioByFund = {
      "2000-01-01": {
        "equity": 0.75,
        "bond": 0.25
      }
    }
    const rebalancingFunction = rebalancePortfolioFunction(equityRatioByFund, 0.0)

    const dollarsToMove = rebalancingFunction({
      previousDayPortfolio: {
        date: "2001-01-01",
        shares: {
          "equity": 2,
          "bond": 2
        },
        marketValues: {}
      },
      openingPrices: {
        "equity": 50,
        "bond": 50
      },
      todayDateString: "2000-01-01"
    })

    expect(dollarsToMove).toEqual({
      "equity": 50,
      "bond": -50
    })
  })

  it("should not rebalance the portfolio if the portfolio is within balance", function () {
    const equityRatioByFund = {
      "2000-01-01": {
        "equity": 0.75,
        "bond": 0.25
      }
    }

    const rebalancingFunction = rebalancePortfolioFunction(equityRatioByFund, 0.25)

    const dollarsToMove = rebalancingFunction({
      previousDayPortfolio: {
        date: "2001-01-01",
        shares: {
          "equity": 2.5,
          "bond": 1.5
        },
        marketValues: {},
      },
      openingPrices: {
        "equity": 50,
        "bond": 50
      },
      todayDateString: "2000-01-01"
    })

    expect(dollarsToMove).toEqual({
      "equity": 0,
      "bond": 0
    })
  })
})