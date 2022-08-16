import { functionMock } from '../../testing';
import { serializeVariables } from '../serializeVariables';
import { VARIABLE_TYPE, VARIABLE_VALIDATION } from '../constants';

describe('serializeVariables', () => {
  test('should return serialized variables', () => {
    const functionVariables = functionMock.spec.env;
    const configmaps = [];
    const secrets = [];
    const { customVariables, customValueFromVariables } = serializeVariables({
      functionVariables,
      secrets,
      configmaps,
    });

    const expectedCustomVariable = {
      type: VARIABLE_TYPE.CUSTOM,
      name: 'FOO',
      value: 'bar',
      validation: VARIABLE_VALIDATION.NONE,
      dirty: true,
    };
    const customVariable = customVariables[0];
    delete customVariable.id;
    expect(customVariable).toEqual(expectedCustomVariable);

    const expectedCustomValueFromVariable = {
      name: 'PICO',
      dirty: true,
      owners: [],
      type: 'SECRET',
      validation: 'NONE',
      valueFrom: {
        secretKeyRef: {
          name: 'secret',
          key: 'KEY',
        },
      },
    };

    const customValueFromVariable = customValueFromVariables[0];
    delete customValueFromVariable.id;
    expect(customValueFromVariable).toEqual(expectedCustomValueFromVariable);
  });
});
