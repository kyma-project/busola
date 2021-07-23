import React, { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { FormItem, FormInput, FormLabel } from 'fundamental-react';
import { Dropdown } from 'react-shared';

import {
  VARIABLE_TYPE,
  VARIABLE_VALIDATION,
} from 'components/Lambdas/helpers/lambdaVariables';
import { ENVIRONMENT_VARIABLES_PANEL } from 'components/Lambdas/constants';
import { CONFIG } from 'components/Lambdas/config';

import { getValidationStatus, validateVariable } from '../validation';
import './VariableInputs.scss';

export default function ResourceVariableInput({
  currentVariable = {},
  variables = [],
  resources = [],
  injectedVariables = [],
  onUpdateVariable,
  setValidity,
  setInvalidModalPopupMessage,
}) {
  const [variable, setVariable] = useState(currentVariable);
  const [debouncedCallback] = useDebouncedCallback(newVariable => {
    onUpdateVariable(newVariable);
  }, 200);

  function getCurrentResource(name, resource) {
    if (!name || !resource) return {};
    const currentResource = resource.find(s => s.metadata.name === name);
    return currentResource;
  }

  function getInitResource() {
    if (
      currentVariable.type === VARIABLE_TYPE.SECRET &&
      currentVariable?.valueFrom?.secretKeyRef?.name
    ) {
      return getCurrentResource(
        currentVariable?.valueFrom?.secretKeyRef?.name,
        resources,
      );
    }
    if (
      currentVariable.type === VARIABLE_TYPE.CONFIG_MAP &&
      currentVariable?.valueFrom?.configMapKeyRef?.name
    ) {
      return getCurrentResource(
        currentVariable?.valueFrom?.configMapKeyRef?.name,
        resources,
      );
    }
    return getCurrentResource(null, resources);
  }

  const [selectedResource, setSelectedResource] = useState(getInitResource());
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
      setInvalidModalPopupMessage(
        ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.CONFIRM_BUTTON.POPUP_MESSAGES
          .ERROR,
      );
    }
  }, [
    variables,
    variable,
    setValidity,
    setInvalidModalPopupMessage,
    debouncedCallback,
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
      varType: variable.type,
      varValue: variable.valueFrom,
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

  function onChangeValueFrom(valueFrom) {
    const validation = getValidationStatus({
      userVariables: variables,
      injectedVariables,
      restrictedVariables: CONFIG.restrictedVariables,
      varName: variable.name,
      varID: variable.id,
      varDirty: variable.dirty,
      varType: variable.type,
      varValue: valueFrom,
    });
    const newVariable = {
      ...variable,
      validation,
      valueFrom,
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
        message = ENVIRONMENT_VARIABLES_PANEL.ERRORS.EMPTY;
        break;
      case VARIABLE_VALIDATION.INVALID:
        className = 'fd-has-color-status-3';
        message = ENVIRONMENT_VARIABLES_PANEL.ERRORS.INVALID;
        break;
      case VARIABLE_VALIDATION.INVALID_SECRET:
        className = 'fd-has-color-status-3';
        message = ENVIRONMENT_VARIABLES_PANEL.ERRORS.INVALID_SECRET;
        break;
      case VARIABLE_VALIDATION.INVALID_CONFIG:
        className = 'fd-has-color-status-3';
        message = ENVIRONMENT_VARIABLES_PANEL.ERRORS.INVALID_CONFIG;
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
        message =
          ENVIRONMENT_VARIABLES_PANEL.WARNINGS.VARIABLE_CAN_OVERRIDE_SBU;
        break;
      default:
        return null;
    }
    return <span className={className}>{message}</span>;
  }

  const resourceOptions = (resources || []).map(({ metadata }) => ({
    key: metadata.name,
    text: metadata.name,
  }));

  let resourceKeysOptions = Object.keys(selectedResource.data || []).map(
    key => {
      return {
        key: key,
        text: key,
      };
    },
  );

  return (
    <div className="resource-variable-form">
      <FormItem className="grid-input-fields">
        <FormLabel required={true}>Name</FormLabel>
        <FormInput
          id={`variableName-${currentVariable.id}`}
          placeholder={ENVIRONMENT_VARIABLES_PANEL.PLACEHOLDERS.VARIABLE_NAME}
          type="text"
          value={variable.name}
          onChange={onChangeName}
        />
      </FormItem>
      {renderValidationContent()}

      {currentVariable.type === VARIABLE_TYPE.SECRET && (
        <>
          <FormItem className="grid-input-fields">
            <FormLabel required={true}>
              {ENVIRONMENT_VARIABLES_PANEL.VARIABLE_TYPE.SECRET.TEXT}
            </FormLabel>
            <Dropdown
              id={`variableValueFromSecret-${currentVariable.id}`}
              options={resourceOptions}
              onSelect={(_, selected) => {
                setSelectedResource(
                  getCurrentResource(selected.key, resources),
                );
                onChangeValueFrom({
                  secretKeyRef: {
                    name: selected.key,
                    key: null,
                  },
                });
              }}
              selectedKey={
                currentVariable?.valueFrom?.secretKeyRef?.name || null
              }
            />
          </FormItem>
          <FormItem className="grid-input-fields">
            <FormLabel required={true}>Key</FormLabel>
            <Dropdown
              id={`variableKeyFromSecret-${currentVariable.id}`}
              options={resourceKeysOptions}
              onSelect={(_, selected) => {
                onChangeValueFrom({
                  secretKeyRef: {
                    ...currentVariable.valueFrom.secretKeyRef,
                    key: selected.key,
                  },
                });
              }}
              selectedKey={
                currentVariable?.valueFrom?.secretKeyRef?.key || null
              }
            />
          </FormItem>
        </>
      )}

      {currentVariable.type === VARIABLE_TYPE.CONFIG_MAP && (
        <>
          <FormItem className="grid-input-fields">
            <FormLabel required={true}>
              {ENVIRONMENT_VARIABLES_PANEL.VARIABLE_TYPE.CONFIG_MAP.TEXT}
            </FormLabel>
            <Dropdown
              id={`variableValueFromConfigMap-${currentVariable.id}`}
              options={resourceOptions}
              onSelect={(_, selected) => {
                setSelectedResource(
                  getCurrentResource(selected.key, resources),
                );
                onChangeValueFrom({
                  configMapKeyRef: {
                    name: selected.key,
                    key: null,
                  },
                });
              }}
              selectedKey={
                currentVariable?.valueFrom?.configMapKeyRef?.name || null
              }
            />
          </FormItem>
          <FormItem className="grid-input-fields">
            <FormLabel required={true}>Key</FormLabel>
            <Dropdown
              id={`variableKeyFromConfigMap-${currentVariable.id}`}
              options={resourceKeysOptions}
              onSelect={(_, selected) => {
                onChangeValueFrom({
                  configMapKeyRef: {
                    ...currentVariable.valueFrom.configMapKeyRef,
                    key: selected.key,
                  },
                });
              }}
              selectedKey={
                currentVariable?.valueFrom?.configMapKeyRef?.key || null
              }
            />
          </FormItem>
        </>
      )}
    </div>
  );
}
