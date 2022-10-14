import { isEqual } from 'lodash';

//TODO once atoms update separately (and once per reload), this will not be needed
export const luigi_areEqual: <T>(newVal: T, oldVal: T) => boolean = (
  newVal,
  oldVal,
) => isEqual(newVal, oldVal);
