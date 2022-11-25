export function formatAsYYYYMMDD(date: Date) {
  // Target format is yyyy-mm-dd
  return date.toISOString().split('T')[0];
}
