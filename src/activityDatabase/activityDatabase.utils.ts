export function groupByKeys<T extends Record<string, unknown>>(
  items: T[],
): T[][] {
  const groups = new Map<string, T[]>();
  items.forEach((item) => {
    const uniqueKey = Object.entries(item)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => key)
      .sort()
      .reduce((acc, key) => acc + '--' + key, '');
    const group = groups.get(uniqueKey) ?? [];
    group.push(item);
    groups.set(uniqueKey, group);
  });
  return [...groups.values()];
}
