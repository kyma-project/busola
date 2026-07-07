import { describe, it, expect } from 'vitest';
import { getEditViewModeState, EditViewTypes } from '../editViewModeAtom';

describe('getEditViewModeState', () => {
  it('converts a string value to defaults with MODE_DEFAULT preferencesViewType and MODE_FORM dynamicViewType', () => {
    const result = getEditViewModeState('MODE_DEFAULT');
    expect(result).toEqual({
      preferencesViewType: 'MODE_DEFAULT',
      dynamicViewType: 'MODE_FORM',
    });
  });

  it('returns the same object when already an EditViewTypes object', () => {
    const input: EditViewTypes = {
      preferencesViewType: 'MODE_YAML',
      dynamicViewType: 'MODE_YAML',
    };
    const result = getEditViewModeState(input);
    expect(result).toBe(input);
  });

  it('returns defaults for any string input, not just MODE_DEFAULT', () => {
    const result = getEditViewModeState('some-other-string');
    expect(result).toEqual({
      preferencesViewType: 'MODE_DEFAULT',
      dynamicViewType: 'MODE_FORM',
    });
  });

  it('preserves dynamicViewType null when passed as an object', () => {
    const input: EditViewTypes = {
      preferencesViewType: 'MODE_FORM',
      dynamicViewType: null,
    };
    const result = getEditViewModeState(input);
    expect(result.dynamicViewType).toBeNull();
  });
});
