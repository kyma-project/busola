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

export function getSIPrefix(amount, binary = false, { unit = '' } = {}) {
  const prefixMap = binary ? SI_PREFIXES_BINARY : SI_PREFIXES;

  let output = {
    value: amount,
    rounded: amount,
    prefix: '',
    string: `${amount}`,
  };
  Object.entries(prefixMap).forEach(([prefix, power]) => {
    const tmpValue = amount / power;
    if (tmpValue >= 1) {
      const value = Math.round((tmpValue + Number.EPSILON) * 100) / 100;
      output = {
        value,
        rounded: value * power,
        prefix,
        unit: `${prefix}${unit}`,
        string: `${value} ${prefix}${unit}`,
      };
    }
  });

  return output;
}
