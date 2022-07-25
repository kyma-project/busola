import bytes from 'bytes-iec';

export function normalizeMemory(memory = '') {
  if (!memory) {
    return 0;
  }
  const memoryWithSuffix = memory.endsWith('B') ? memory : `${memory}B`;
  return bytes(memoryWithSuffix) || 0;
}

export function compareMemory(limit = '', current = '') {
  if (!limit || !current) {
    return;
  }

  const normalizedLimit = normalizeMemory(limit);
  const normalizedCurrent = normalizeMemory(current);

  return normalizedLimit <= normalizedCurrent;
}

export function areMemoriesEqual(first = '', second = '') {
  const firstMemory = normalizeMemory(first);
  const secondMemory = normalizeMemory(second);

  return firstMemory === secondMemory;
}
