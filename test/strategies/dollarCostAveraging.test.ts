import { Duration } from "luxon"
import { dollarCostAveraging } from "../../src/strategies/dollarCostAveraging"

describe("dollar cost averaging strategy", function () {

  const createParameter = ({ todayDateString }) => ({ openingPrices: { "bond": 0, "equity": 0 }, todayDateString })
  it("should invest at the specified frequency", function () {
    const weeklyInvestment = dollarCostAveraging(
      1000,
      Duration.fromObject({ week: 1 }),
      { "bond": 0.5, "equity": 0.5 }
    )

    const week1Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-01" }))
    expect(week1Investment.bond).toBeCloseTo(500, 4)
    expect(week1Investment.equity).toBeCloseTo(500, 4)

    const week2Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-08" }))
    expect(week2Investment.bond).toBeCloseTo(500, 4)
    expect(week2Investment.equity).toBeCloseTo(500, 4)

    const week3Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-15" }))
    expect(week3Investment.bond).toBeCloseTo(500, 4)
    expect(week3Investment.equity).toBeCloseTo(500, 4)

    const week4Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-22" }))
    expect(week4Investment.bond).toBeCloseTo(500, 4)
    expect(week4Investment.equity).toBeCloseTo(500, 4)
  })

  it("should not invest any amount when the dates don't satisfy the frequency", function () {
    const weeklyInvestment = dollarCostAveraging(
      1000,
      Duration.fromObject({ week: 1 }),
      { "bond": 0.5, "equity": 0.5 }
    )

    const week1Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-01" }))
    expect(week1Investment.bond).toBeCloseTo(500, 4)
    expect(week1Investment.equity).toBeCloseTo(500, 4)

    const week1Day1Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-02" }))
    expect(week1Day1Investment.bond).toEqual(0)
    expect(week1Day1Investment.equity).toEqual(0)

    const week1Day2Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-03" }))
    expect(week1Day2Investment.bond).toEqual(0)
    expect(week1Day2Investment.equity).toEqual(0)

    const week1Day3Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-04" }))
    expect(week1Day3Investment.bond).toEqual(0)
    expect(week1Day3Investment.equity).toEqual(0)

    const week1Day4Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-05" }))
    expect(week1Day4Investment.bond).toEqual(0)
    expect(week1Day4Investment.equity).toEqual(0)

    const week1Day5Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-06" }))
    expect(week1Day5Investment.bond).toEqual(0)
    expect(week1Day5Investment.equity).toEqual(0)

    const week1Day6Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-07" }))
    expect(week1Day6Investment.bond).toEqual(0)
    expect(week1Day6Investment.equity).toEqual(0)

    const week2Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-08" }))
    expect(week2Investment.bond).toBeCloseTo(500, 4)
    expect(week2Investment.equity).toBeCloseTo(500, 4)
  })

  it("should invest at the closest intervals", function () {
    const weeklyInvestment = dollarCostAveraging(
      1000,
      Duration.fromObject({ week: 1 }),
      { "bond": 0.5, "equity": 0.5 }
    )

    const week1Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-01" }))
    expect(week1Investment.bond).toBeCloseTo(500, 4)
    expect(week1Investment.equity).toBeCloseTo(500, 4)

    // Missing data from 01-02 to 01-08 on purpose.

    const week2Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-09" }))
    expect(week2Investment.bond).toBeCloseTo(500, 4)
    expect(week2Investment.equity).toBeCloseTo(500, 4)

    const week2Day6Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-14" }))
    expect(week2Day6Investment.bond).toEqual(0)
    expect(week2Day6Investment.equity).toEqual(0)

    const week3Investment = weeklyInvestment(createParameter({ todayDateString: "2000-01-15" }))
    expect(week3Investment.bond).toBeCloseTo(500, 4)
    expect(week3Investment.equity).toBeCloseTo(500, 4)

    const week3NextDayInvestment = weeklyInvestment(createParameter({ todayDateString: "2000-01-16" }))
    expect(week3NextDayInvestment.bond).toEqual(0)
    expect(week3NextDayInvestment.equity).toEqual(0)
  })
})