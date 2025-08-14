const SI_PREFIXES = {
  p: 1e-12,
  n: 1e-9,
  µ: 1e-6,
  m: 1e-3,
  '': 1,
  k: 1e3,
  K: 1e3,
  M: 1e6,
  G: 1e9,
  T: 1e12,
  P: 1e15,
  E: 1e18,
};

const SI_PREFIXES_BINARY = {
  '': 1,
  Ki: 2 ** 10,
  Mi: 2 ** 20,
  Gi: 2 ** 30,
  Ti: 2 ** 40,
  Pi: 2 ** 50,
  Ei: 2 ** 60,
};

const MEMORY_PREFIXES = {
  ...SI_PREFIXES,
  ...SI_PREFIXES_BINARY,
};

/*
More precise round method.
Fixes floating point precision issues (e.g., 1.005 rounds to 1.01)
 */
const preciseRound = (num, places) => {
  const multiplier = Math.pow(10, places);
  return Math.round((num + Number.EPSILON) * multiplier) / multiplier;
};

export function formatResourceUnit(
  amount = 0,
  binary = false,
  { unit = '', withoutSpace = true, fixed = 2 } = {},
) {
  const prefixMap = binary ? SI_PREFIXES_BINARY : SI_PREFIXES;
  const infix = withoutSpace ? '' : ' ';

  if (unit && prefixMap[unit]) {
    const value = Number((amount / prefixMap[unit]).toFixed(fixed));
    return {
      string: `${value.toString()}${infix}${unit}`,
      unit: unit,
      value: value,
    };
  }

  const coreValue = Number(preciseRound(amount, 2).toFixed(fixed));

  let output = {
    string: `${coreValue.toString()}${infix}${unit}`,
    unit: unit,
    value: coreValue,
  };

  Object.entries(prefixMap).forEach(([prefix, power]) => {
    const tmpValue = amount / power;
    if (tmpValue >= 1) {
      const value = Number(preciseRound(tmpValue, 2).toFixed(fixed));
      output = {
        string: `${value.toString()}${infix}${prefix}${unit}`,
        unit: unit,
        value: value,
      };
    }
  });

  return output;
}

export function bytesToHumanReadable(bytes, { fixed = 1, unit = '' } = {}) {
  return formatResourceUnit(bytes, true, { withoutSpace: true, fixed, unit });
}

export function cpusToHumanReadable(cpus, { fixed = 0, unit = '' } = {}) {
  return formatResourceUnit(cpus, false, { withoutSpace: true, fixed, unit });
}

export function getCpus(cpuString) {
  if (!cpuString || cpuString === '0') {
    return 0;
  }

  const suffix = String(cpuString).slice(-1);

  const suffixPower = SI_PREFIXES[suffix];
  if (!suffixPower) {
    return parseFloat(cpuString);
  }

  const number = String(cpuString).replace(suffix, '');
  return number * suffixPower;
}

export function getBytes(memoryStr) {
  if (!memoryStr) return 0;

  const unit = String(memoryStr).match(/[a-zA-Z]+/g)?.[0];
  const value = parseFloat(memoryStr);
  const bytes = value * (MEMORY_PREFIXES[unit] || 1);
  return bytes;
}
