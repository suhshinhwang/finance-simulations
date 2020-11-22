const { getCorrelation } = require("../analysis/statistics")

describe("calculating correlations", function () {
  it("should calculate positive correlations", function () {
    {
      const v1 = [0, 1, 2, 3, 4, 5, 6]
      const v2 = [0, 1, 2, 3, 4, 5, 6]
      expect(getCorrelation(v1, v2)).toBeCloseTo(1, 4)
    }
    {
      const v1 = [0, 1, 2, 3, 4, 5, 6]
      const v2 = [0, 0.5, 1, 1.5, 2, 2.5, 3]
      expect(getCorrelation(v1, v2)).toBeCloseTo(1, 4)
    }
    {
      const v1 = [0, 1, 2, 3, 4, 5, 6]
      const v2 = [0, 1, 4, 9, 16, 25, 36]
      expect(getCorrelation(v1, v2)).toBeCloseTo(0.9608, 4)
    }
    {
      const v1 = [0, 1, 2, 3, 4, 5, 6]
      const v2 = [0, 1, 1.4142, 1.7321, 2, 2.2361, 2.4495]
      expect(getCorrelation(v1, v2)).toBeCloseTo(0.9552, 4)
    }
    {
      const v1 = [0, 1, 2, 3, 4, 5, 6]
      const v2 = [0, 1, 0.8, 2, 1.8, 3, 2.8]
      expect(getCorrelation(v1, v2)).toBeCloseTo(0.9468, 4)
    }
  })

  it("should calculate negative correlations", function () {
    {
      const v1 = [0, 1, 2, 3, 4, 5, 6]
      const v2 = [0, -1, -2, -3, -4, -5, -6]
      expect(getCorrelation(v1, v2)).toBeCloseTo(-1, 4)
    }
    {
      const v1 = [0, 1, 2, 3, 4, 5, 6]
      const v2 = [0, -0.5, -1, -1.5, -2, -2.5, -3]
      expect(getCorrelation(v1, v2)).toBeCloseTo(-1, 4)
    }
    {
      const v1 = [0, 1, 2, 3, 4, 5, 6]
      const v2 = [0, - 1, -4, -9, -16, -25, -36]
      expect(getCorrelation(v1, v2)).toBeCloseTo(-0.9608, 4)
    }
    {
      const v1 = [0, 1, 2, 3, 4, 5, 6]
      const v2 = [0, -1, -1.4142, -1.7321, -2, -2.2361, -2.4495]
      expect(getCorrelation(v1, v2)).toBeCloseTo(-0.9552, 4)
    }
    {
      const v1 = [0, 1, 2, 3, 4, 5, 6]
      const v2 = [0, -1, -0.8, -2, -1.8, -3, -2.8]
      expect(getCorrelation(v1, v2)).toBeCloseTo(-0.9468, 4)
    }
  })

  it("should calculate low correlations", function () {
    const v1 = [1, 2, 3, 4, 5, 6]
    const v2 = [-5, 5, -5, 5, -5, 5]
    expect(getCorrelation(v1, v2)).toBeCloseTo(0.2928, 4)
  })
})