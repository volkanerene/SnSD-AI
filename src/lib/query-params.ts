// Helper to build query string from object
export function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';

  const filtered = Object.entries(params).filter(
    ([_, value]) => value !== undefined && value !== null
  );

  if (filtered.length === 0) return '';

  const queryString = filtered
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  return `?${queryString}`;
}
