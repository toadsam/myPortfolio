export function groupByDate<T>(
  items: T[],
  dateOf: (item: T) => string
): [string, T[]][] {
  const order: string[] = [];
  const map: Record<string, T[]> = {};
  for (const item of items) {
    const key = dateOf(item);
    if (!map[key]) {
      map[key] = [];
      order.push(key);
    }
    map[key].push(item);
  }
  return order.map(key => [key, map[key]!]);
}

export function matchesQuery(
  query: string,
  fields: (string | undefined)[]
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some(field => (field ?? "").toLowerCase().includes(q));
}
