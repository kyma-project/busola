import React, { useState } from 'react';

import { FormInput, FormItem, FormLabel } from 'fundamental-react';

import { K8sNameInput, useMicrofrontendContext } from 'react-shared';
import { VARIABLE_TYPE } from 'components/Lambdas/helpers/lambdaVariables';
import { CONFIG } from 'components/Lambdas/config';
import { useUpdateLambda, UPDATE_TYPE } from 'components/Lambdas/hooks';

import CustomVariableInput from '../CustomVariableInput/CustomVariableInput';
import {
  getValidationStatus,
  validateVariable,
  validateVariables,
} from '../validation';

export const FORM_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
};

export default function VariableForm({
  formElementRef,
  setValidity = () => void 0,
  setCustomValid = () => void 0,
  setInvalidModalPopupMessage = () => void 0,
  lambda,
  currentVariable,
  setCurrentVariable = () => void 0,
  customVariables,
  customValueFromVariables,
  injectedVariables,
  formType = FORM_TYPE.CREATE,
}) {
  const updateLambdaVariables = useUpdateLambda({
    lambda,
    type: UPDATE_TYPE.VARIABLES,
  });

  function prepareVariablesInput(variables, newVariable) {
    return variables.map(variable => {
      if (newVariable.id === variable.id) {
        variable = {
          ...variable,
          ...newVariable,
        };
      }
      if (variable.type === VARIABLE_TYPE.CUSTOM) {
        return {
          name: variable.name,
          value: variable.value,
        };
      }
      return {
        name: variable.name,
        valueFrom: variable.valueFrom,
      };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    let customValueExits =
      [...customVariables, ...customValueFromVariables].findIndex(variable => {
        return variable.id === currentVariable.id;
      }) > 0;
    const updatedVariables = !customValueExits
      ? [...customVariables, currentVariable, ...customValueFromVariables]
      : [...customVariables, ...customValueFromVariables];
    const preparedVariable = prepareVariablesInput(
      updatedVariables,
      currentVariable,
    );

    updateLambdaVariables({
      spec: {
        ...lambda.spec,
        env: [...preparedVariable],
      },
    });
  }

  function onUpdateVariable(newVariable) {
    setCurrentVariable(newVariable);
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={e => e.preventDefault()}
      ref={formElementRef}
      noValidate
    >
      <CustomVariableInput
        currentVariable={currentVariable}
        variables={[...customVariables, ...customValueFromVariables]}
        injectedVariables={injectedVariables}
        onUpdateVariable={onUpdateVariable}
        setValidity={setValidity}
        setCustomValid={setCustomValid}
        setInvalidModalPopupMessage={setInvalidModalPopupMessage}
      />
    </form>
  );
}
