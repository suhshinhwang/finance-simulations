
enum PriceType {
  open = "open",
  close = "close"
}

type DollarByFund = { [fund: string]: number }

type SharesByFund = { [fund: string]: number }

type OpenClosePriceByFund = { [priceType in PriceType]: DollarByFund }

type OpenClosePriceByFundByDate = { [date: string]: OpenClosePriceByFund }

export { DollarByFund, SharesByFund, OpenClosePriceByFund, OpenClosePriceByFundByDate }