import { VARIABLE_TYPE, VARIABLE_VALIDATION } from './constants';

export function newVariableModel({
  type = VARIABLE_TYPE.CUSTOM,
  variable = {},
  validation = VARIABLE_VALIDATION.NONE,
  additionalProps = {},
}) {
  const id = `${type}/${variable.name || ''}`;

  return type === VARIABLE_TYPE.CUSTOM
    ? {
        id,
        type,
        name: variable.name || '',
        value: variable.value || '',
        validation: validation,
        ...additionalProps,
      }
    : {
        id,
        type,
        name: variable.name || '',
        valueFrom: variable.valueFrom || {},
        validation: validation,
        ...additionalProps,
      };
}
