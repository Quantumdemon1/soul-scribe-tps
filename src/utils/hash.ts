// Utility to create stable hashes for caching keys
// - stableStringify: deterministic JSON stringification (sorted keys)
// - stableHash: DJB2 hash over stable stringified input, returns hex

function stableStringifyInternal(value: any): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(stableStringifyInternal).join(',') + ']';
  }
  // Object: sort keys
  const keys = Object.keys(value).sort();
  const entries = keys.map((k) => JSON.stringify(k) + ':' + stableStringifyInternal(value[k]));
  return '{' + entries.join(',') + '}';
}

export function stableStringify(value: any): string {
  try {
    return stableStringifyInternal(value);
  } catch (e) {
    // Fallback to native stringify if anything goes wrong
    return JSON.stringify(value);
  }
}

export function stableHash(value: any): string {
  const str = typeof value === 'string' ? value : stableStringify(value);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // DJB2: hash * 33 ^ char
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    // Force to 32-bit int
    hash = hash >>> 0;
  }
  // Return as hex with prefix for readability
  return 'h' + hash.toString(16);
}
