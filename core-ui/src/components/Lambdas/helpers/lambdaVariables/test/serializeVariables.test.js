import { lambdaMock, serviceBindingUsageMock } from '../../testing';
import {
  serializeVariables,
  retrieveVariablesFromBindingUsage,
} from '../serializeVariables';
import { VARIABLE_TYPE, VARIABLE_VALIDATION } from '../constants';

describe('retrieveVariablesFromBindingUsage', () => {
  test('should correct retrieve variables from bindingUsage', () => {
    const envs = retrieveVariablesFromBindingUsage(serviceBindingUsageMock);
    const expectedEnvs = [
      {
        key: 'PREFIX_FOO',
        valueFrom: { secretKeyRef: { key: 'FOO', name: 'secret' } },
      },
      {
        key: 'PREFIX_BAR',
        valueFrom: { secretKeyRef: { key: 'BAR', name: 'secret' } },
      },
    ];

    expect(envs).toEqual(expectedEnvs);
  });
});

describe('serializeVariables', () => {
  test('should return serialized variables', () => {
    const lambdaVariables = lambdaMock.spec.env;
    const bindingUsages = [serviceBindingUsageMock];
    const configmaps = [];
    const secrets = [];
    const {
      customVariables,
      customValueFromVariables,
      injectedVariables,
    } = serializeVariables({
      lambdaVariables,
      bindingUsages,
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
      name: 'PICO',
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

  test.skip('should return serialized variables with CAN_OVERRIDE_BY_CUSTOM_ENV warnings', () => {
    const lambdaVariables = [
      {
        name: 'PREFIX_FOO',
        value: 'bar',
        valueFrom: null,
      },
    ];
    const bindingUsages = [serviceBindingUsageMock];

    const { injectedVariables } = serializeVariables({
      lambdaVariables,
      bindingUsages,
    });

    const expectedInjectedVariables = [
      {
        type: VARIABLE_TYPE.BINDING_USAGE,
        name: 'PREFIX_FOO',
        value: 'foo',
        validation: VARIABLE_VALIDATION.CAN_OVERRIDE_BY_CUSTOM_ENV,
        serviceInstanceName: 'serviceInstanceName',
      },
      {
        type: VARIABLE_TYPE.BINDING_USAGE,
        name: 'PREFIX_BAR',
        value: 'bar',
        validation: VARIABLE_VALIDATION.NONE,
        serviceInstanceName: 'serviceInstanceName',
      },
    ];
    delete injectedVariables[0].id;
    delete injectedVariables[1].id;
    expect(injectedVariables).toEqual(expectedInjectedVariables);
  });

  test.skip('should return serialized variables with CAN_OVERRIDE_BY_SBU warnings', () => {
    const lambdaVariables = lambdaMock.env;
    const bindingUsages = [serviceBindingUsageMock, serviceBindingUsageMock];

    const { injectedVariables } = serializeVariables({
      lambdaVariables,
      bindingUsages,
    });

    const expectedInjectedVariables = [
      {
        type: VARIABLE_TYPE.BINDING_USAGE,
        name: 'PREFIX_FOO',
        value: 'foo',
        validation: VARIABLE_VALIDATION.CAN_OVERRIDE_BY_SBU,
        serviceInstanceName: 'serviceInstanceName',
      },
      {
        type: VARIABLE_TYPE.BINDING_USAGE,
        name: 'PREFIX_BAR',
        value: 'bar',
        validation: VARIABLE_VALIDATION.CAN_OVERRIDE_BY_SBU,
        serviceInstanceName: 'serviceInstanceName',
      },
      {
        type: VARIABLE_TYPE.BINDING_USAGE,
        name: 'PREFIX_FOO',
        value: 'foo',
        validation: VARIABLE_VALIDATION.CAN_OVERRIDE_BY_SBU,
        serviceInstanceName: 'serviceInstanceName',
      },
      {
        type: VARIABLE_TYPE.BINDING_USAGE,
        name: 'PREFIX_BAR',
        value: 'bar',
        validation: VARIABLE_VALIDATION.CAN_OVERRIDE_BY_SBU,
        serviceInstanceName: 'serviceInstanceName',
      },
    ];
    delete injectedVariables[0].id;
    delete injectedVariables[1].id;
    delete injectedVariables[2].id;
    delete injectedVariables[3].id;
    expect(injectedVariables).toEqual(expectedInjectedVariables);
  });

  test.skip('should return serialized variables with CAN_OVERRIDE_BY_CUSTOM_ENV_AND_SBU warnings', () => {
    const lambdaVariables = [
      {
        name: 'PREFIX_FOO',
        value: 'bar',
        valueFrom: null,
      },
    ];
    const bindingUsages = [serviceBindingUsageMock, serviceBindingUsageMock];

    const { injectedVariables } = serializeVariables({
      lambdaVariables,
      bindingUsages,
    });

    const expectedInjectedVariables = [
      {
        type: VARIABLE_TYPE.BINDING_USAGE,
        name: 'PREFIX_FOO',
        value: 'foo',
        validation: VARIABLE_VALIDATION.CAN_OVERRIDE_BY_CUSTOM_ENV_AND_SBU,
        serviceInstanceName: 'serviceInstanceName',
      },
      {
        type: VARIABLE_TYPE.BINDING_USAGE,
        name: 'PREFIX_BAR',
        value: 'bar',
        validation: VARIABLE_VALIDATION.CAN_OVERRIDE_BY_SBU,
        serviceInstanceName: 'serviceInstanceName',
      },
      {
        type: VARIABLE_TYPE.BINDING_USAGE,
        name: 'PREFIX_FOO',
        value: 'foo',
        validation: VARIABLE_VALIDATION.CAN_OVERRIDE_BY_CUSTOM_ENV_AND_SBU,
        serviceInstanceName: 'serviceInstanceName',
      },
      {
        type: VARIABLE_TYPE.BINDING_USAGE,
        name: 'PREFIX_BAR',
        value: 'bar',
        validation: VARIABLE_VALIDATION.CAN_OVERRIDE_BY_SBU,
        serviceInstanceName: 'serviceInstanceName',
      },
    ];
    delete injectedVariables[0].id;
    delete injectedVariables[1].id;
    delete injectedVariables[2].id;
    delete injectedVariables[3].id;
    expect(injectedVariables).toEqual(expectedInjectedVariables);
  });
});
