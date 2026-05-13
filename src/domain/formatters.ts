export function formatPopulation(value?: number) {
  if (value === undefined) {
    return "Unknown";
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)}B`;
}

export function formatCarbon(value?: number) {
  if (value === undefined) {
    return "Unknown";
  }

  return `${Math.round(value)} ppm`;
}

export function formatPercent(value?: number) {
  if (value === undefined) {
    return "Unknown";
  }

  return `${Math.round(value)}%`;
}

export function formatAcres(value?: number) {
  if (value === undefined) {
    return "Unknown";
  }

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B acres`;
  }

  return `${Math.round(value / 1_000_000).toLocaleString()}M acres`;
}

export function formatCount(value?: number) {
  if (value === undefined) {
    return "Unknown";
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000).toLocaleString()}K`;
  }

  return value.toLocaleString();
}
