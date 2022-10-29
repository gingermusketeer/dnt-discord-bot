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

export function getVisbookId(url: string): number {
  if (url === null) {
    return 0;
  }

  const urlParts = url.split('/');
  for (const part of urlParts) {
    const int = parseInt(part, 10);
    if (isNaN(int)) {
      continue;
    } else {
      return int;
    }
  }

  return 0;
}

export function isReservationsUrl(url: string): boolean {
  if (url.includes('reservations')) {
    return true;
  }

  return false;
}
