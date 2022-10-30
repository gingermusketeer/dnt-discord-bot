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
  if (!isValidUrl(url)) return false;

  const parsedUrl = new URL(url);
  return parsedUrl.hostname.includes('reservations');
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
  } catch {
    return false;
  }
  return true;
}
