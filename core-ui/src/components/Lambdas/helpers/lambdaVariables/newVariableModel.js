import shortid from 'shortid';
import { VARIABLE_TYPE, VARIABLE_VALIDATION } from './constants';

export function newVariableModel({
  type = VARIABLE_TYPE.CUSTOM,
  variable = {},
  validation = VARIABLE_VALIDATION.NONE,
  additionalProps = {},
}) {
  return type === VARIABLE_TYPE.CUSTOM
    ? {
        id: shortid.generate(),
        type,
        name: variable.name || '',
        value: variable.value || '',
        validation: validation,
        ...additionalProps,
      }
    : {
        id: shortid.generate(),
        type,
        name: variable.name || '',
        valueFrom: variable.valueFrom || {},
        validation: validation,
        ...additionalProps,
      };
}
