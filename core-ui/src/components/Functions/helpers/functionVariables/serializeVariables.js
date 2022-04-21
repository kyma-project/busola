import { newVariableModel } from './newVariableModel';
import { VARIABLE_TYPE, VARIABLE_VALIDATION } from './constants';

export function serializeVariables({
  functionVariables = [],
  bindingUsages = [],
  secrets = [],
  configmaps = [],
}) {
  const bindingUsageVariableNames = [];
  let bindingUsageVariables = bindingUsages.flatMap(bindingUsage => {
    const variables = retrieveVariablesFromBindingUsage(bindingUsage);
    bindingUsageVariableNames.push(...variables.map(v => v.key));
    return {
      bindingUsage,
      variables,
    };
  });

  const customVariablesNames = [];
  const customVariables = [];
  const customValueFromVariables = [];

  functionVariables.forEach(variable => {
    const isValueFromVariable =
      variable.valueFrom && Object.keys(variable.valueFrom).length;

    let typeOfValueFromVariable;
    let owners;

    if (variable.valueFrom?.configMapKeyRef) {
      typeOfValueFromVariable = VARIABLE_TYPE.CONFIG_MAP;
      owners = getOwner(variable, configmaps, 'configMapKeyRef');
    } else if (variable.valueFrom?.secretKeyRef) {
      typeOfValueFromVariable = VARIABLE_TYPE.SECRET;
      owners = getOwner(variable, secrets, 'secretKeyRef');
    } else {
      typeOfValueFromVariable = VARIABLE_TYPE.CUSTOM;
    }
    if (isValueFromVariable) {
      customVariablesNames.push(variable.name);
      customValueFromVariables.push(
        newVariableModel({
          type: VARIABLE_TYPE[typeOfValueFromVariable],
          variable: {
            name: variable.name,
            valueFrom: variable.valueFrom,
          },
          additionalProps: {
            dirty: true,
            owners: owners,
          },
        }),
      );
      return;
    }
    customVariablesNames.push(variable.name);
    customVariables.push(
      newVariableModel({
        type: VARIABLE_TYPE.CUSTOM,
        variable: {
          name: variable.name,
          value: variable.value,
        },
        additionalProps: { dirty: true },
      }),
    );
  });

  bindingUsageVariables = bindingUsageVariables.flatMap(
    ({ variables, bindingUsage }) => {
      const serializedInjectedVariables = [];

      variables.forEach(({ key: variableName, valueFrom }) => {
        let validation = VARIABLE_VALIDATION.NONE;

        const canOverrideByCustomVar = customVariablesNames.includes(
          variableName,
        );
        const canOverrideBySBU =
          bindingUsageVariableNames.filter(v => v === variableName).length > 1;

        if (canOverrideByCustomVar && canOverrideBySBU) {
          validation = VARIABLE_VALIDATION.CAN_OVERRIDE_BY_CUSTOM_ENV_AND_SBU;
        } else if (canOverrideByCustomVar) {
          validation = VARIABLE_VALIDATION.CAN_OVERRIDE_BY_CUSTOM_ENV;
        } else if (canOverrideBySBU) {
          validation = VARIABLE_VALIDATION.CAN_OVERRIDE_BY_SBU;
        }
        const newVariable = newVariableModel({
          type: VARIABLE_TYPE.BINDING_USAGE,
          variable: {
            name: variableName,
            valueFrom: valueFrom,
          },
          validation,
          additionalProps: {
            serviceInstanceName:
              bindingUsage.serviceBinding.spec.instanceRef.name,
          },
        });
        serializedInjectedVariables.push(newVariable);
      });

      return serializedInjectedVariables;
    },
  );

  return {
    customVariables,
    customValueFromVariables,
    injectedVariables: bindingUsageVariables,
  };
}

export function retrieveVariablesFromBindingUsage(binding) {
  let envPrefix = '';
  if (
    binding.serviceBindingUsage.spec.parameters &&
    binding.serviceBindingUsage.spec.parameters.envPrefix
  ) {
    envPrefix =
      binding.serviceBindingUsage.spec.parameters.envPrefix.name || '';
  }

  const secretData = binding.secret && binding.secret.data;

  return Object.entries(secretData || {}).map(([env, value]) => ({
    key: `${envPrefix}${env}`,
    valueFrom: {
      secretKeyRef: {
        name: binding.secret.metadata.name,
        key: env,
      },
    },
  }));
}

function getOwner(variable, resources, resourceValueFromType) {
  if (!resources) return [];
  const filteredResources = (resources || []).filter(
    resource =>
      resource.metadata.name === variable.valueFrom[resourceValueFromType].name,
  );
  if (
    !filteredResources?.length ||
    !filteredResources[0].metadata.ownerReferences
  )
    return [];
  let owners = [];
  filteredResources[0].metadata.ownerReferences.forEach(owner => {
    owners.push({
      apiVersion: owner.apiVersion,
      name: owner.name,
      kind: owner.kind,
    });
  });
  return owners;
}
