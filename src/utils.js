/*
 * utils for gregorian date
 * @ignore
 * @author yiminghe@gmail.com
 */

const Const = require('./const');
const floor = Math.floor;
const ACCUMULATED_DAYS_IN_MONTH
  //   1/1 2/1 3/1 4/1 5/1 6/1 7/1 8/1 9/1 10/1 11/1 12/1
  = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

const ACCUMULATED_DAYS_IN_MONTH_LEAP
  //   1/1 2/1   3/1   4/1   5/1   6/1   7/1   8/1   9/1
  // 10/1   11/1   12/1
  = [0, 31, 59 + 1, 90 + 1, 120 + 1, 151 + 1, 181 + 1,
  212 + 1, 243 + 1, 273 + 1, 304 + 1, 334 + 1];

const DAYS_OF_YEAR = 365;
const DAYS_OF_4YEAR = 365 * 4 + 1;
const DAYS_OF_100YEAR = DAYS_OF_4YEAR * 25 - 1;
const DAYS_OF_400YEAR = DAYS_OF_100YEAR * 4 + 1;
let exports = {};

function getDayOfYear(year, month, dayOfMonth) {
  return dayOfMonth + (exports.isLeapYear(year) ?
      ACCUMULATED_DAYS_IN_MONTH_LEAP[month] :
      ACCUMULATED_DAYS_IN_MONTH[month]);
}

function getDayOfWeekFromFixedDate(fixedDate) {
  // The fixed day 1 (January 1, 1 Gregorian) is Monday.
  if (fixedDate >= 0) {
    return fixedDate % 7;
  }
  return exports.mod(fixedDate, 7);
}

function getGregorianYearFromFixedDate(fixedDate) {
  let d0;
  let d1;
  let d2;
  let d3;
  let n400;
  let n100;
  let n4;
  let n1;
  let year;
  d0 = fixedDate - 1;

  n400 = floor(d0 / DAYS_OF_400YEAR);
  d1 = exports.mod(d0, DAYS_OF_400YEAR);
  n100 = floor(d1 / DAYS_OF_100YEAR);
  d2 = exports.mod(d1, DAYS_OF_100YEAR);
  n4 = floor(d2 / DAYS_OF_4YEAR);
  d3 = exports.mod(d2, DAYS_OF_4YEAR);
  n1 = floor(d3 / DAYS_OF_YEAR);

  year = 400 * n400 + 100 * n100 + 4 * n4 + n1;

  // ?
  if (!(n100 === 4 || n1 === 4)) {
    ++year;
  }

  return year;
}

exports = module.exports = {
  each(arr, fn) {
    for (let i = 0, len = arr.length; i < len; i++) {
      if (fn(arr[i], i, arr) === false) {
        break;
      }
    }
  },

  mix(t, s) {
    for (const p in s) {
      if (s.hasOwnProperty(p)) {
        t[p] = s[p];
      }
    }
  },

  isLeapYear(year) {
    if ((year & 3) !== 0) {
      return false;
    }
    return (year % 100 !== 0) || (year % 400 === 0);
  },

  mod(x, y) {
    // 负数时不是镜像关系
    return (x - y * floor(x / y));
  },

  // month: 0 based
  getFixedDate(year, month, dayOfMonth) {
    const prevYear = year - 1;
    // 考虑公元前
    return DAYS_OF_YEAR * prevYear + floor(prevYear / 4) -
      floor(prevYear / 100) + floor(prevYear / 400) +
      getDayOfYear(year, month, dayOfMonth);
  },

  getGregorianDateFromFixedDate(fixedDate) {
    const year = getGregorianYearFromFixedDate(fixedDate);
    const jan1 = exports.getFixedDate(year, Const.JANUARY, 1);
    const isLeap = exports.isLeapYear(year);
    const ACCUMULATED_DAYS = isLeap ? ACCUMULATED_DAYS_IN_MONTH_LEAP : ACCUMULATED_DAYS_IN_MONTH;
    const daysDiff = fixedDate - jan1;
    let month;

    for (let i = 0; i < ACCUMULATED_DAYS.length; i++) {
      if (ACCUMULATED_DAYS[i] <= daysDiff) {
        month = i;
      } else {
        break;
      }
    }

    const dayOfMonth = fixedDate - jan1 - ACCUMULATED_DAYS[month] + 1;
    const dayOfWeek = getDayOfWeekFromFixedDate(fixedDate);

    return {
      year: year,
      month: month,
      dayOfMonth: dayOfMonth,
      dayOfWeek: dayOfWeek,
      isLeap: isLeap,
    };
  },
};
