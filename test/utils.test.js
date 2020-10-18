const { TestScheduler } = require("jest")
const { findClosestDate, formatDate, dateFrom, durationBetweenInDays } = require("../src/utils")

describe("find closest date", function () {
  test("will find the closest date in the array", () => {
    const dates = [
      new Date(Date.parse("2000-01-01")),
      new Date(Date.parse("2000-01-02")),
    ]
    {
      expect(findClosestDate(dates, "2000-01-01")).toEqual(new Date(Date.parse("2000-01-01")))
    }
    {
      expect(findClosestDate(dates, "2000-01-02")).toEqual(new Date(Date.parse("2000-01-02")))
    }
  })

  test("will find the closest date even if the date is not in the array", () => {
    const dates = [
      new Date(Date.parse("2000-01-01")),
      new Date(Date.parse("2000-01-02")),
    ]
    {
      expect(findClosestDate(dates, "1999-12-31")).toEqual(new Date(Date.parse("2000-01-01")))
    }
    {
      expect(findClosestDate(dates, "2000-01-03")).toEqual(new Date(Date.parse("2000-01-02")))
    }
  })
})

describe("date from", function () {
  test("parses correctly from string", () => {
    {
      const date = dateFrom("2000-12-01")
      expect(date.getFullYear()).toBe(2000)
      expect(date.getMonth()).toBe(11) // getMonth starts from 0
      expect(date.getDate()).toBe(1)
    }
    {
      const date = dateFrom("2000-12-31")
      expect(date.getFullYear()).toBe(2000)
      expect(date.getMonth()).toBe(11) // getMonth starts from 0
      expect(date.getDate()).toBe(31)
    }
  })
})

describe("format date", function () {
  test("output dates correctly", () => {
    expect(formatDate(dateFrom("2000-01-01"))).toEqual("2000-01-01")
    expect(formatDate(dateFrom("2000-12-31"))).toEqual("2000-12-31")
  })
})

describe("duration between dates in months", function () {
  test("computes the difference correctly", () => {
    expect(durationBetweenInDays(
      dateFrom("2000-01-10"),
      dateFrom("2000-02-10")
    )).toBe(31)
  })
})