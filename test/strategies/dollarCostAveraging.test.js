const { Duration } = require("luxon")
const { dollarCostAveraging } = require("../../src/strategies/dollarCostAveraging")

describe("dollar cost averaging strategy", function () {
  it("should invest at the specified frequency", function () {
    const weeklyInvestment = dollarCostAveraging(1000, Duration.fromObject({ week: 1 }), 0.5)

    const week1Investment = weeklyInvestment({ todayDateString: "2000-01-01" })
    expect(week1Investment.bondDollarChange).toBeCloseTo(500, 4)
    expect(week1Investment.equityDollarChange).toBeCloseTo(500, 4)


    const week2Investment = weeklyInvestment({ todayDateString: "2000-01-08" })
    expect(week2Investment.bondDollarChange).toBeCloseTo(500, 4)
    expect(week2Investment.equityDollarChange).toBeCloseTo(500, 4)

    const week3Investment = weeklyInvestment({ todayDateString: "2000-01-15" })
    expect(week3Investment.bondDollarChange).toBeCloseTo(500, 4)
    expect(week3Investment.equityDollarChange).toBeCloseTo(500, 4)

    const week4Investment = weeklyInvestment({ todayDateString: "2000-01-22" })
    expect(week4Investment.bondDollarChange).toBeCloseTo(500, 4)
    expect(week4Investment.equityDollarChange).toBeCloseTo(500, 4)
  })

  it("should not invest any amount when the dates don't satisify the frequency", function () {
    const weeklyInvestment = dollarCostAveraging(1000, Duration.fromObject({ week: 1 }), 0.5)

    const week1Investment = weeklyInvestment({ todayDateString: "2000-01-01" })
    expect(week1Investment.bondDollarChange).toBeCloseTo(500, 4)
    expect(week1Investment.equityDollarChange).toBeCloseTo(500, 4)

    const week1Day1Investment = weeklyInvestment({ todayDateString: "2000-01-02" })
    expect(week1Day1Investment.bondDollarChange).toEqual(0)
    expect(week1Day1Investment.equityDollarChange).toEqual(0)

    const week1Day2Investment = weeklyInvestment({ todayDateString: "2000-01-03" })
    expect(week1Day2Investment.bondDollarChange).toEqual(0)
    expect(week1Day2Investment.equityDollarChange).toEqual(0)

    const week1Day3Investment = weeklyInvestment({ todayDateString: "2000-01-04" })
    expect(week1Day3Investment.bondDollarChange).toEqual(0)
    expect(week1Day3Investment.equityDollarChange).toEqual(0)

    const week1Day4Investment = weeklyInvestment({ todayDateString: "2000-01-05" })
    expect(week1Day4Investment.bondDollarChange).toEqual(0)
    expect(week1Day4Investment.equityDollarChange).toEqual(0)

    const week1Day5Investment = weeklyInvestment({ todayDateString: "2000-01-06" })
    expect(week1Day5Investment.bondDollarChange).toEqual(0)
    expect(week1Day5Investment.equityDollarChange).toEqual(0)

    const week1Day6Investment = weeklyInvestment({ todayDateString: "2000-01-07" })
    expect(week1Day6Investment.bondDollarChange).toEqual(0)
    expect(week1Day6Investment.equityDollarChange).toEqual(0)

    const week2Investment = weeklyInvestment({ todayDateString: "2000-01-08" })
    expect(week2Investment.bondDollarChange).toBeCloseTo(500, 4)
    expect(week2Investment.equityDollarChange).toBeCloseTo(500, 4)
  })

  it("should invest at the closest intervals", function () {
    const weeklyInvestment = dollarCostAveraging(1000, Duration.fromObject({ week: 1 }), 0.5)

    const week1Investment = weeklyInvestment({ todayDateString: "2000-01-01" })
    expect(week1Investment.bondDollarChange).toBeCloseTo(500, 4)
    expect(week1Investment.equityDollarChange).toBeCloseTo(500, 4)

    // Missing data from 01-02 to 01-08 on purpose.

    const week2Investment = weeklyInvestment({ todayDateString: "2000-01-09" })
    expect(week2Investment.bondDollarChange).toBeCloseTo(500, 4)
    expect(week2Investment.equityDollarChange).toBeCloseTo(500, 4)

    const week2Day6Investment = weeklyInvestment({ todayDateString: "2000-01-14" })
    expect(week2Day6Investment.bondDollarChange).toEqual(0)
    expect(week2Day6Investment.equityDollarChange).toEqual(0)

    const week3Investment = weeklyInvestment({ todayDateString: "2000-01-15" })
    expect(week3Investment.bondDollarChange).toBeCloseTo(500, 4)
    expect(week3Investment.equityDollarChange).toBeCloseTo(500, 4)

    const week3NextDayInvestment = weeklyInvestment({ todayDateString: "2000-01-16" })
    expect(week3NextDayInvestment.bondDollarChange).toEqual(0)
    expect(week3NextDayInvestment.equityDollarChange).toEqual(0)
  })
})