import React, { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { FormItem, FormInput, FormLabel } from 'fundamental-react';

import { VARIABLE_VALIDATION } from 'components/Functions/helpers/functionVariables';
import { CONFIG } from 'components/Functions/config';

import { getValidationStatus, validateVariable } from '../validation';
import { useTranslation } from 'react-i18next';
import './VariableInputs.scss';

export default function CustomVariableInput({
  currentVariable = {},
  variables = [],
  injectedVariables = [],
  onUpdateVariable,
  setValidity,
  setInvalidModalPopupMessage,
  resources,
}) {
  const { t } = useTranslation();
  const [variable, setVariable] = useState(currentVariable);
  const debouncedCallback = useDebouncedCallback(newVariable => {
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
      resources,
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

  function renderValidationContent() {
    const { validation } = variable;
    if (validation === VARIABLE_VALIDATION.NONE) {
      return null;
    }

    let className = undefined;
    let message = '';
    switch (validation) {
      case VARIABLE_VALIDATION.EMPTY:
        className = 'fd-has-color-status-3';
        message = t('functions.variable.errors.empty');
        break;
      case VARIABLE_VALIDATION.INVALID:
        className = 'fd-has-color-status-3';
        message = t('functions.variable.errors.invalid');
        break;
      case VARIABLE_VALIDATION.DUPLICATED:
        className = 'fd-has-color-status-3';
        message = t('functions.variable.errors.duplicated');
        break;
      case VARIABLE_VALIDATION.RESTRICTED:
        className = 'fd-has-color-status-3';
        message = t('functions.variable.errors.restricted');
        break;
      case VARIABLE_VALIDATION.CAN_OVERRIDE_SBU:
        className = 'fd-has-color-status-2';
        message = t('functions.variable.warnings.override');
        break;
      default:
        return null;
    }
    return <span className={className}>{message}</span>;
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
      {renderValidationContent()}
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
