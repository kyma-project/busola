import React, { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { FormItem, FormInput, FormLabel } from 'fundamental-react';

import { VARIABLE_VALIDATION } from 'components/Lambdas/helpers/lambdaVariables';
import { ENVIRONMENT_VARIABLES_PANEL } from 'components/Lambdas/constants';
import { CONFIG } from 'components/Lambdas/config';

import { getValidationStatus, validateVariable } from '../validation';
import { useTranslation } from 'react-i18next';
import './VariableInputs.scss';

function RenderValidationContent(validation) {
  const { t } = useTranslation();

  if (validation === VARIABLE_VALIDATION.NONE) {
    return null;
  }

  let className = undefined;
  let message = '';
  switch (validation) {
    case VARIABLE_VALIDATION.EMPTY:
      className = 'fd-has-color-status-3';
      message = ENVIRONMENT_VARIABLES_PANEL.ERRORS.EMPTY;
      break;
    case VARIABLE_VALIDATION.INVALID:
      className = 'fd-has-color-status-3';
      message = ENVIRONMENT_VARIABLES_PANEL.ERRORS.INVALID;
      break;
    case VARIABLE_VALIDATION.DUPLICATED:
      className = 'fd-has-color-status-3';
      message = ENVIRONMENT_VARIABLES_PANEL.ERRORS.DUPLICATED;
      break;
    case VARIABLE_VALIDATION.RESTRICTED:
      className = 'fd-has-color-status-3';
      message = ENVIRONMENT_VARIABLES_PANEL.ERRORS.RESTRICTED;
      break;
    case VARIABLE_VALIDATION.CAN_OVERRIDE_SBU:
      className = 'fd-has-color-status-2';
      message = t('functions.variable.warnings.variable-can-override-sbu');
      break;
    default:
      return null;
  }

  return <span className={className}>{message}</span>;
}
export default function CustomVariableInput({
  currentVariable = {},
  variables = [],
  injectedVariables = [],
  onUpdateVariable,
  setValidity,
  setInvalidModalPopupMessage,
}) {
  const { t } = useTranslation();
  const [variable, setVariable] = useState(currentVariable);
  const [debouncedCallback] = useDebouncedCallback(newVariable => {
    onUpdateVariable(newVariable);
  }, 200);

  useEffect(() => {
    setValidity(false);
  }, [setValidity]);

  useEffect(() => {
    setVariable(currentVariable);
  }, [currentVariable]);

  useEffect(() => {
    const validate = validateVariable(variables, variable);
    setValidity(validate);

    if (!validate) {
      setInvalidModalPopupMessage(t('functions.variable.popup-error'));
    }
  }, [
    variables,
    variable,
    setValidity,
    setInvalidModalPopupMessage,
    debouncedCallback,
    t,
  ]);

  function onChangeName(event) {
    const name = event.target.value;
    const validation = getValidationStatus({
      userVariables: variables,
      injectedVariables,
      restrictedVariables: CONFIG.restrictedVariables,
      varName: name,
      varID: variable.id,
      varDirty: variable.dirty,
    });
    const newVariable = {
      ...variable,
      validation,
      name,
      dirty: true,
    };
    setVariable(newVariable);
    debouncedCallback(newVariable);
  }

  function onChangeValue(event) {
    const value = event.target.value;

    const newVariable = {
      ...variable,
      value,
      dirty: true,
    };
    setVariable(newVariable);
    debouncedCallback(newVariable);
  }

  return (
    <div className="custom-variable-form">
      <FormItem className="grid-input-fields">
        <FormLabel required={true}>
          {t('functions.variable.form.name')}
        </FormLabel>
        <FormInput
          id={`variableName-${currentVariable.id}`}
          placeholder={t('functions.variable.placeholders.name')}
          type="text"
          value={variable.name}
          onChange={onChangeName}
        />
      </FormItem>
      <RenderValidationContent validation={variable.validation} />
      <FormItem className="grid-input-fields">
        <FormLabel>{t('functions.variable.form.value')}</FormLabel>
        <FormInput
          id={`variableValue-${currentVariable.id}`}
          placeholder={t('functions.variable.placeholders.value')}
          type="text"
          value={variable.value}
          onChange={onChangeValue}
        />
      </FormItem>
    </div>
  );
}
