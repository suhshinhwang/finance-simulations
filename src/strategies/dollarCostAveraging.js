const { DateTime } = require("luxon")
const { dateFrom } = require("../utils")

function dollarCostAveraging(investmentAmount, durationTilNextPurchase, equityRatio) {
  let nextInvestmentDate = null // luxon DateTime
  return function ({
    todayDateString,
  }) {
    if (nextInvestmentDate == null) {
      nextInvestmentDate = DateTime.fromJSDate(dateFrom(todayDateString))
    }

    const todayDateTime = DateTime.fromJSDate(dateFrom(todayDateString))
    let equityDollarChange = 0, bondDollarChange = 0;

    if (nextInvestmentDate != null && todayDateTime >= nextInvestmentDate) {
      nextInvestmentDate = nextInvestmentDate.plus(durationTilNextPurchase)

      equityDollarChange = investmentAmount * equityRatio
      bondDollarChange = investmentAmount * (1 - equityRatio)
    }

    return { equityDollarChange, bondDollarChange }
  }
}

module.exports.dollarCostAveraging = dollarCostAveraging