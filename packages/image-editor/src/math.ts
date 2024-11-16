export function intSign(x: number): number {
  return ~!!x + 1 + (((x + 0x7fffffff) & 0x80000000) >> 30);
}

export function intAbs(x: number): number {
  const offset = x >> 31;

  return (offset + x) ^ offset;
}

export function maxInt(a: number, b: number): number {
  return a - ((a - b) & ((a - b) >> 31));
}

export function minInt(a: number, b: number): number {
  return a - ((a - b) & ((b - a) >> 31));
}

export function clampInt(a: number, min: number, max: number): number {
  return maxInt(minInt(a, max), min);
}
