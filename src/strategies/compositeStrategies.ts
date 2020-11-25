import * as _ from "lodash"
import { DollarChangeFunction } from "../computeMarketValues"

function compositeInvestmentStrategy(strategies: DollarChangeFunction[]): DollarChangeFunction {
  return function ({
    previousDayPortfolio,
    openingPrices,
    todayDateString,
  }) {
    const initialChangesByFund = _.reduce(openingPrices, (changes, __, fund) => {
      changes[fund] = 0
      return changes
    }, {})
    return _.reduce(strategies, (dollarChanges, strategy) => {
      const changesByFund = strategy({
        previousDayPortfolio,
        openingPrices,
        todayDateString,
      })

      const totalChange = _.reduce(dollarChanges, (changes, dollarChange, fund) => {
        changes[fund] = dollarChange + changesByFund[fund]
        return changes
      }, {})

      return totalChange
    }, initialChangesByFund)
  }
}

export { compositeInvestmentStrategy }