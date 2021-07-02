import { formatVersion, areParamsCompatible } from './../params-version';
import * as constants from './../constants';

describe('formatVersion', () => {
  // version to format, output
  const cases = [
    ['1', '1.0'],
    ['2.3', '2.0'],
    ['4.5.6', '4.0'],
  ];

  test.each(cases)(
    'Formats versions, leaving only major (%p -> %p)',
    (version, expected) => {
      const result = formatVersion(version);
      expect(result).toEqual(expected);
    },
  );
});

describe('areParamsCompatible', () => {
  // version, PARAMS_VERSION, are compatible
  const cases = [
    ['1', '1.0', true],
    ['1', '1.1', true],
    ['1', '2.0', false],
    ['2', '1.0', false],
    ['1.5', '1.0', true],
  ];

  test.each(cases)(
    'Compares versions (%p ? %p -> %p)',
    (version, paramsVersion, expected) => {
      constants.PARAMS_VERSION = paramsVersion;
      const result = areParamsCompatible(version);
      expect(result).toEqual(expected);
    },
  );
});
