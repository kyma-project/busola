import {
  VARIABLE_TYPE,
  VARIABLE_VALIDATION,
  ERROR_VARIABLE_VALIDATION,
  ALL_KEYS,
} from 'components/Functions/helpers/functionVariables';
import { CONFIG } from 'components/Functions/config';
import i18next from 'i18next';

export function validateVariables(
  customVariables = [],
  customValueFromVariables = [],
  injectedVariables = [],
  resources,
) {
  return [...customVariables, ...customValueFromVariables].map(
    (variable, _, array) => {
      const validation = getValidationStatus({
        userVariables: array,
        injectedVariables,
        restrictedVariables: CONFIG.restrictedVariables,
        varName: variable.name,
        varID: variable.id,
        varValue: variable.value || variable.valueFrom,
        varType: variable.type,
        varDirty: variable.dirty,
        resources,
      });
      return {
        ...variable,
        validation,
      };
    },
  );
}

export function validateVariable(variables = [], currentVariable = {}) {
  if (!currentVariable.name) {
    return false;
  }
  if (ERROR_VARIABLE_VALIDATION.includes(currentVariable.validation)) {
    return false;
  }

  // check if secret and config map has value and key

  if (
    currentVariable.type === VARIABLE_TYPE.SECRET &&
    (!currentVariable?.valueFrom?.secretKeyRef?.name ||
      !currentVariable?.valueFrom?.secretKeyRef?.key)
  ) {
    return false;
  }

  if (
    currentVariable.type === VARIABLE_TYPE.CONFIG_MAP &&
    (!currentVariable?.valueFrom?.configMapKeyRef?.name ||
      !currentVariable?.valueFrom?.configMapKeyRef?.key)
  ) {
    return false;
  }

  // exclude currentVariable, because variables array include old currentVariable
  const someVarIsEmpty = variables.some(
    env => currentVariable.id !== env.id && !env.name,
  );
  if (someVarIsEmpty) {
    return false;
  }

  // exclude currentVariable, because variables array include old currentVariable
  const someVarHasError = variables.some(
    env =>
      currentVariable.id !== env.id &&
      ERROR_VARIABLE_VALIDATION.includes(env.validation),
  );
  if (someVarHasError) {
    return false;
  }

  return true;
}

function isVariableTakeAll(varValue) {
  return (
    varValue?.secretKeyRef?.key === ALL_KEYS ||
    varValue?.configMapKeyRef?.key === ALL_KEYS
  );
}

function getTakeAllDuplicates(
  varName,
  varType,
  varValue,
  resources,
  userVariables,
  injectedVariables,
  restrictedVariables,
) {
  // name of secret or configMap
  const prop =
    varType === VARIABLE_TYPE.SECRET ? 'secretKeyRef' : 'configMapKeyRef';
  const resourceName = varValue[prop].name;
  const choosenResource = resources.find(r => r.metadata.name === resourceName);
  // names of data from secret or configMap
  const resourceDataNames = Object.keys(choosenResource?.data || {}).map(
    key => varName + key,
  );

  return [
    ...resourceDataNames.filter(name =>
      userVariables.map(n => n.name).includes(name),
    ),
    ...resourceDataNames.filter(name =>
      injectedVariables.map(n => n.name).includes(name),
    ),
    ...resourceDataNames.filter(name =>
      restrictedVariables.map(n => n.name).includes(name),
    ),
  ];
}

export function getValidationStatus({
  userVariables = [],
  injectedVariables = [],
  restrictedVariables = [],
  varName,
  varID,
  varValue,
  varType,
  varDirty = false,
  resources,
}) {
  const isTakeAll = isVariableTakeAll(varValue);
  if (isTakeAll) {
    const duplicates = getTakeAllDuplicates(
      varName,
      varType,
      varValue,
      resources,
      userVariables,
      injectedVariables,
      restrictedVariables,
    );

    if (duplicates.length) {
      return i18next.t('functions.variable.errors.duplicate-multiple-names', {
        names: duplicates.join(', '),
      });
    }
  }

  // empty
  if (!varName) {
    if (varDirty) {
      return VARIABLE_VALIDATION.EMPTY;
    }
    return VARIABLE_VALIDATION.NONE;
  }

  if (restrictedVariables.includes(varName)) {
    return VARIABLE_VALIDATION.RESTRICTED;
  }

  // name validation is different for takeAll
  if (isTakeAll) {
    const regex = /^[a-zA-Z]([a-zA-Z0-9_-]*)$/;
    if (!varName || !regex.test(varName)) {
      return VARIABLE_VALIDATION.INVALID;
    }
    // don't run next validations
    return VARIABLE_VALIDATION.NONE;
  }

  const regex = /^[a-zA-Z]([a-zA-Z0-9_]*)$/;
  if (!varName || !regex.test(varName)) {
    return VARIABLE_VALIDATION.INVALID;
  }

  // check if secret and config map has value and key

  if (
    varType === VARIABLE_TYPE.SECRET &&
    (!varValue?.secretKeyRef?.name || !varValue?.secretKeyRef?.key)
  ) {
    return VARIABLE_VALIDATION.INVALID_SECRET;
  }

  if (
    varType === VARIABLE_TYPE.CONFIG_MAP &&
    (!varValue?.configMapKeyRef?.name || !varValue?.configMapKeyRef?.key)
  ) {
    return VARIABLE_VALIDATION.INVALID_CONFIG;
  }

  // duplicated
  if (
    userVariables.some(
      variable => variable.id !== varID && variable.name === varName,
    )
  ) {
    return VARIABLE_VALIDATION.DUPLICATED;
  }
  // override SBU
  if (
    injectedVariables.some(
      variable =>
        variable.type === VARIABLE_TYPE.BINDING_USAGE &&
        variable.name === varName,
    )
  ) {
    return VARIABLE_VALIDATION.CAN_OVERRIDE_SBU;
  }

  return VARIABLE_VALIDATION.NONE;
}
