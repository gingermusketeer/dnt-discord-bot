import { zonedTimeToUtc } from 'date-fns-tz';
import { set, format } from 'date-fns';

const zone = 'Europe/Oslo';

const months = [
  'januar',
  'februar',
  'mars',
  'april',
  'mai',
  'juni',
  'juli',
  'august',
  'september',
  'oktober',
  'november',
  'desember',
];

export function parseTime(str: string, date: DateConfig) {
  const [hrs, minutes] = str.split(':');

  return {
    ...date,
    hours: parseInt(hrs ?? '0'),
    minutes: parseInt(minutes ?? '0'),
  };
}

type DateConfig = {
  minutes: number;
  hours: number;
  day: number;
  month: number;
  year: number;
};

function parseNbDate(str: string): [DateConfig] | [DateConfig, DateConfig] {
  const [day, month, times] = str.split('.');
  // If we have a year then it is included in the month
  const year = month.replace(/\D+/, '');
  const yearNum = parseInt(year);
  const beginningOfDay: DateConfig = {
    year: Number.isNaN(yearNum) ? new Date().getFullYear() : yearNum,
    day: parseInt(day),
    month: months.findIndex((m) => month.includes(m)) + 1,
    hours: 0,
    minutes: 0,
  };
  if (!times) {
    return [beginningOfDay];
  }
  const [start, end] = (times ?? '').split('-');
  const startDate = parseTime(start, beginningOfDay);
  if (!end) {
    return [startDate];
  }

  return [startDate, parseTime(end, beginningOfDay)];
}

function padWithZero(number: number): string {
  if (number > 9) {
    return number.toString();
  }
  return `0${number}`;
}

export function parseNbDateToUtc(str: string) {
  const dates = parseNbDate(str);
  return dates.map((dateConfig) => {
    const strWithoutZone = `${dateConfig.year}-${padWithZero(
      dateConfig.month,
    )}-${padWithZero(dateConfig.day)}T${padWithZero(
      dateConfig.hours,
    )}:${padWithZero(dateConfig.minutes)}`;
    return zonedTimeToUtc(strWithoutZone, zone);
  });
}
