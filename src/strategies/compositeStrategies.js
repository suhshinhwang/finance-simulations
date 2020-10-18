const _ = require("lodash")

function compositeInvestmentStrategy(strategies) {
  return function ({
    previousDayPortfolio,
    bondOpeningPrice,
    equityOpeningPrice,
    todayDateString,
  }) {
    return _.reduce(strategies, (dollarChanges, strategy) => {
      const { equityDollarChange: strategyEquityDollarChange, bondDollarChange: strategyBondDollarChange } = strategy({
        previousDayPortfolio,
        bondOpeningPrice,
        equityOpeningPrice,
        todayDateString,
      })

      return {
        equityDollarChange: dollarChanges.equityDollarChange + strategyEquityDollarChange,
        bondDollarChange: dollarChanges.bondDollarChange + strategyBondDollarChange
      }
    }, { equityDollarChange: 0, bondDollarChange: 0 })
  }
}

module.exports.compositeInvestmentStrategy = compositeInvestmentStrategy