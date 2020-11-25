import * as _ from "lodash"
import { DateTime, Duration } from "luxon"
import { DollarChangeFunction } from "../computeMarketValues"
import { dateFrom } from "../utils"
import { RatioByFund } from "../types"

function dollarCostAveraging(investmentAmount: number, durationTilNextPurchase: Duration, equityRatio: RatioByFund): DollarChangeFunction {
  let nextInvestmentDate: DateTime = null
  return function ({
    openingPrices,
    todayDateString,
  }) {
    if (nextInvestmentDate == null) {
      nextInvestmentDate = DateTime.fromJSDate(dateFrom(todayDateString))
    }

    const todayDateTime = DateTime.fromJSDate(dateFrom(todayDateString))
    let dollarChangeByFund = _.reduce(openingPrices, (changes, __, fund) => {
      changes[fund] = 0
      return changes
    }, {})


    if (nextInvestmentDate != null && todayDateTime >= nextInvestmentDate) {
      nextInvestmentDate = nextInvestmentDate.plus(durationTilNextPurchase)

      _.keys(openingPrices).forEach(fund => {
        dollarChangeByFund[fund] = investmentAmount * equityRatio[fund]
      })
    }

    return dollarChangeByFund
  }
}

export { dollarCostAveraging }