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

export function getSIPrefix(
  amount,
  binary = false,
  { unit = '', withoutSpace = true, fixed = 2 } = {},
) {
  const prefixMap = binary ? SI_PREFIXES_BINARY : SI_PREFIXES;
  const infix = withoutSpace ? '' : ' ';

  const coreValue = (
    Math.round((+amount + Number.EPSILON) * 100) / 100
  ).toFixed(fixed);
  let output = {
    raw: amount,
    value: coreValue,
    rounded: coreValue,
    prefix: '',
    string: `${coreValue}${infix}${unit}`,
  };
  Object.entries(prefixMap).forEach(([prefix, power]) => {
    const tmpValue = amount / power;
    if (tmpValue >= 1) {
      const value = (
        Math.round((tmpValue + Number.EPSILON) * 100) / 100
      ).toFixed(fixed);
      output = {
        raw: tmpValue,
        value,
        rounded: value * power,
        prefix,
        unit: `${prefix}${unit}`,
        string: `${value}${infix}${prefix}${unit}`,
      };
    }
  });

  return output;
}
