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
