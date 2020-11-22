const _ = require("lodash")

const { DateTime } = require("luxon")

/**
 * @param {moment[]} dates Dates to look for
 * @param {YYYY-MM-DD} target Target date to look for
 * @returns {moment} Closest date in _dates_ to _target_
 */

module.exports.findClosestDate = function (dates, target) {
  const targetDate = (function () {
    if (_.isDate(target)) {
      return target;
    } else {
      return dateFrom(target)
    }
  })()
  return _.minBy(dates, (date) => {
    const diff = Math.abs(targetDate - date.valueOf());
    return diff;
  });
};

module.exports.log = function (t) {
  console.log(JSON.stringify(t, null, 2));
};

const dateFormat = "yyyy-MM-dd"

module.exports.formatDate = function (date) {
  if (DateTime.isDateTime(date)) {
    date.toFormat(dateFormat)
  } else {
    return DateTime.fromJSDate(date).toFormat(dateFormat)
  }

}

function dateFrom(dateString) {
  return DateTime.fromFormat(dateString, dateFormat).toJSDate()
}
module.exports.dateFrom = dateFrom

module.exports.durationBetweenInDays = function (date1, date2) {
  return DateTime.fromJSDate(date2).diff(DateTime.fromJSDate(date1), 'days').toObject().days
}

class Duration {
  years
  months
  days

  constructor(years, months, days) {
    this.years = years;
    this.months = months;
    this.days = days;
  }

  add(duration) {
    return new Duration(this.years + duration.years, this.months + duration.months, this.days + duration.days)
  }

  addTo(date) {
    const newDate = new Date(date)
    newDate.setFullYear(
      date.getFullYear() + (this.years || 0),
      date.getMonth() + (this.months || 0),
      date.getDate() + (this.days || 0)
    )
    return newDate;
  }
}

module.exports.Duration = Duration

// Sample frequency is n per year.
function sample(sampleFrequency, simulationValues) {
  const samplePeriod = Duration.fromObject({ year: (1 / sampleFrequency) })

  const startDate = simulationValues[0].date
  const endDate = dateFrom(_.last(simulationValues).date)

  const output = []
  for (
    let currentDate = DateTime.fromJSDate(dateFrom(startDate));
    +dateFrom(currentDate) <= endDate;
    currentDate = currentDate.plus(samplePeriod)
  ) {
    const currentDateString = formatDate(currentDate)

    output.push(simulationValues[currentDateString])
  }
}