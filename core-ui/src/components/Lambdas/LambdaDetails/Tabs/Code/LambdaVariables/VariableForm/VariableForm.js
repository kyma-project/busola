import React, { useState } from 'react';

import {
  VARIABLE_TYPE,
  newVariableModel,
  ALL_KEYS,
} from 'components/Lambdas/helpers/lambdaVariables';
import { useUpdateLambda, UPDATE_TYPE } from 'components/Lambdas/hooks';

import CustomVariableInput from '../VariableInputs/CustomVariableInput';
import ResourceVariableInput from '../VariableInputs/ResourceVariableInput';

export const FORM_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
};

const EMPTY_VARIABLE_CUSTOM = {
  type: VARIABLE_TYPE.CUSTOM,
  variable: {
    name: '',
    value: '',
  },
  additionalProps: { dirty: true },
};
const EMPTY_VARIABLE_SECRET = {
  type: VARIABLE_TYPE.SECRET,
  variable: {
    name: '',
    valueFrom: {
      secretKeyRef: {
        name: null,
        key: null,
      },
    },
  },
  additionalProps: { dirty: true },
};

const EMPTY_VARIABLE_CONFIG_MAP = {
  type: VARIABLE_TYPE.CONFIG_MAP,
  variable: {
    name: '',
    valueFrom: {
      configMapKeyRef: {
        name: null,
        key: null,
      },
    },
  },
  additionalProps: { dirty: true },
};
const EMPTY_VARIABLE = {
  CUSTOM: EMPTY_VARIABLE_CUSTOM,
  SECRET: EMPTY_VARIABLE_SECRET,
  CONFIG_MAP: EMPTY_VARIABLE_CONFIG_MAP,
};
export default function VariableForm({
  formElementRef,
  setCustomValid = () => void 0,
  setInvalidModalPopupMessage = () => void 0,
  lambda,
  resources,
  variable,
  type,
  customVariables,
  customValueFromVariables,
  injectedVariables,
  isEdit,
}) {
  const updateLambdaVariables = useUpdateLambda({
    lambda,
    type: UPDATE_TYPE.VARIABLES,
  });

  const [currentVariable, setCurrentVariable] = useState(
    variable || newVariableModel(EMPTY_VARIABLE[type]),
  );
  function prepareVariablesInput(variables, newVariable) {
    return variables.flatMap(variable => {
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
      } else {
        const prop =
          variable.type === VARIABLE_TYPE.SECRET
            ? 'secretKeyRef'
            : 'configMapKeyRef';
        const isTakeAll = variable.valueFrom[prop].key === ALL_KEYS;
        if (isTakeAll) {
          const resourceName = variable.valueFrom[prop].name;
          const choosenResource = resources.find(
            r => r.metadata.name === resourceName,
          );
          return Object.keys(choosenResource.data).map(key => ({
            name: variable.name + key,
            valueFrom: {
              [prop]: {
                key,
                name: resourceName,
              },
            },
          }));
        }
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
      }) >= 0;
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
      {currentVariable.type === VARIABLE_TYPE.CUSTOM && (
        <CustomVariableInput
          className="CustomVariableInput"
          currentVariable={currentVariable}
          resources={resources}
          variables={[...customVariables, ...customValueFromVariables]}
          injectedVariables={injectedVariables}
          onUpdateVariable={onUpdateVariable}
          setValidity={setCustomValid}
          setCustomValid={setCustomValid}
          setInvalidModalPopupMessage={setInvalidModalPopupMessage}
        />
      )}
      {(currentVariable.type === VARIABLE_TYPE.SECRET ||
        currentVariable.type === VARIABLE_TYPE.CONFIG_MAP) && (
        <ResourceVariableInput
          currentVariable={currentVariable}
          resources={resources}
          variables={[...customVariables, ...customValueFromVariables]}
          injectedVariables={injectedVariables}
          onUpdateVariable={onUpdateVariable}
          setValidity={setCustomValid}
          setCustomValid={setCustomValid}
          setInvalidModalPopupMessage={setInvalidModalPopupMessage}
          isEdit={isEdit}
        />
      )}
    </form>
  );
}
