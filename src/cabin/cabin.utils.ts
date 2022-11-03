export function hasExceededTimeLimit(
  start: number,
  now: number,
  timeLimit: number,
): boolean {
  const elapsedTime = now - start;
  if (elapsedTime >= timeLimit) {
    return true;
  }
  return false;
}

export function dateIsValid(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (dateString.match(regex) === null) {
    return false;
  }

  const date = new Date(dateString);
  const timestamp = date.getTime();

  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
    return false;
  }

  return date.toISOString().startsWith(dateString);
}
