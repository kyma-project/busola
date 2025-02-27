const SI_PREFIXES = {
  p: 1e-12,
  n: 1e-9,
  µ: 1e-6,
  m: 1e-3,
  '': 1,
  k: 1e3,
  M: 1e6,
  G: 1e9,
  T: 1e12,
  P: 1e15,
  E: 1e18,
};

const SI_PREFIXES_BINARY = {
  Ki: 2 ** 10,
  Mi: 2 ** 20,
  Gi: 2 ** 30,
  Ti: 2 ** 40,
  Pi: 2 ** 50,
};

/*
More precise round method.
Want 1.005 to be rounded to 1.01 we need to add Number.EPSILON to fix the float inaccuracy
 */
const preciseRound = (num, places) =>
  Math.round((num + Number.EPSILON) * Math.pow(10, places)) /
  Math.pow(10, places);

export function formatResourceUnit(
  amount = 0,
  binary = false,
  { unit = '', withoutSpace = true, fixed = 2 } = {},
) {
  const prefixMap = binary ? SI_PREFIXES_BINARY : SI_PREFIXES;
  const infix = withoutSpace ? '' : ' ';

  if (unit && prefixMap[unit]) {
    const value = (amount / prefixMap[unit]).toFixed(fixed);
    return {
      string: `${value}${infix}${unit}`,
      unit: unit,
      value: Number(value),
    };
  }

  const coreValue = preciseRound(amount, 2).toFixed(fixed);

  let output = {
    string: `${coreValue}${infix}${unit}`,
    unit: unit,
    value: Number(coreValue),
  };

  Object.entries(prefixMap).forEach(([prefix, power]) => {
    const tmpValue = amount / power;
    if (tmpValue >= 1) {
      const value = preciseRound(tmpValue, 2).toFixed(fixed);
      output = {
        string: `${value}${infix}${prefix}${unit}`,
        unit: unit,
        value: Number(value),
      };
    }
  });

  return output;
}
