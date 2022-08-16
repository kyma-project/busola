import { newVariableModel } from './newVariableModel';
import { VARIABLE_TYPE } from './constants';

export function serializeVariables({
  functionVariables = [],
  secrets = [],
  configmaps = [],
}) {
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

  return {
    customVariables,
    customValueFromVariables,
  };
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
