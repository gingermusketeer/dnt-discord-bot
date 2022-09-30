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

export function parseTime(str: string, date: Date) {
  const [hrs, minutes] = str.split(':');

  date.setHours(parseInt(hrs ?? '0'), parseInt(minutes ?? '0'), 0, 0);
}

export function parseNbDate(str: string, now: Date) {
  const date = new Date(now);
  date.setMilliseconds(0);
  const [day, month, times] = str.split('.');
  date.setDate(parseInt(day));
  date.setMonth(months.findIndex((m) => month.includes(m)));
  if (!times) {
    date.setHours(0, 0, 0, 0);
    return [date];
  }
  const [start, end] = (times ?? '').split('-');
  parseTime(start, date);
  if (!end) {
    return [date];
  }

  const endDate = new Date(date);
  parseTime(end, endDate);
  return [date, endDate];
}
