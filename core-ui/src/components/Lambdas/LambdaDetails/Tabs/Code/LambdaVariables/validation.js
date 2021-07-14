import {
  VARIABLE_TYPE,
  VARIABLE_VALIDATION,
  ERROR_VARIABLE_VALIDATION,
} from 'components/Lambdas/helpers/lambdaVariables';
import { CONFIG } from 'components/Lambdas/config';

export function validateVariables(
  customVariables = [],
  customValueFromVariables = [],
  injectedVariables = [],
) {
  return [...customVariables, ...customValueFromVariables].map(
    (variable, _, array) => {
      const validation = getValidationStatus({
        userVariables: array,
        injectedVariables,
        restrictedVariables: CONFIG.restrictedVariables,
        varName: variable.name,
        varID: variable.id,
        varValue: variable.value ? variable.value : variable.valueFrom,
        varType: variable.type,
        varDirty: variable.dirty,
      });
      console.log('validation', validation);
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

export function getValidationStatus({
  userVariables = [],
  injectedVariables = [],
  restrictedVariables = [],
  varName,
  varID,
  varValue,
  varType,
  varDirty = false,
}) {
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

  // invalidate
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
