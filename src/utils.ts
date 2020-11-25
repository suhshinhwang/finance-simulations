import * as _ from "lodash";

import { DateTime } from "luxon";

/**
 * @param {moment[]} dates Dates to look for
 * @param {YYYY-MM-DD} target Target date to look for
 * @returns {moment} Closest date in _dates_ to _target_
 */

function findClosestDate(dates: Date[], target: string | Date): Date {
  const targetDate = (function () {
    if (_.isDate(target)) {
      return target;
    } else {
      return dateFrom(target)
    }
  })()
  return _.minBy(dates, (date) => {
    const diff = Math.abs(+targetDate - date.valueOf());
    return diff;
  });
};

function log(t) {
  console.log(JSON.stringify(t, null, 2));
};

const dateFormat = "yyyy-MM-dd"

function formatDate(date: Date | DateTime) {
  if (DateTime.isDateTime(date)) {
    date.toFormat(dateFormat)
  } else {
    return DateTime.fromJSDate(date).toFormat(dateFormat)
  }

}

function dateFrom(dateString: string): Date {
  return DateTime.fromFormat(dateString, dateFormat).toJSDate()
}

function durationBetweenInDays(date1: Date, date2: Date) {
  return DateTime.fromJSDate(date2).diff(DateTime.fromJSDate(date1), 'days').toObject().days
}

export { findClosestDate, log, formatDate, dateFrom, durationBetweenInDays }

// Sample frequency is n per year.
// function sample(sampleFrequency, simulationValues) {
//   const samplePeriod = Duration.fromObject({ year: (1 / sampleFrequency) })

//   const startDate = simulationValues[0].date
//   const endDate = dateFrom(_.last(simulationValues).date)

//   const output = []
//   for (
//     let currentDate = DateTime.fromJSDate(dateFrom(startDate));
//     +dateFrom(currentDate) <= endDate;
//     currentDate = currentDate.plus(samplePeriod)
//   ) {
//     const currentDateString = formatDate(currentDate)

//     output.push(simulationValues[currentDateString])
//   }
// }