import React, { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { FormItem, FormInput, InfoLabel } from 'fundamental-react';

import {
  VARIABLE_TYPE,
  VARIABLE_VALIDATION,
} from 'components/Lambdas/helpers/lambdaVariables';
import { ENVIRONMENT_VARIABLES_PANEL } from 'components/Lambdas/constants';
import { CONFIG } from 'components/Lambdas/config';

import { Dropdown } from 'react-shared';
import { getValidationStatus, validateVariable } from './validation';

export default function SingleVariableInput({
  currentVariable = {},
  variables = [],
  injectedVariables = [],
  configmaps = [],
  secrets = [],
  onUpdateVariables,
  setValidity,
  setInvalidModalPopupMessage,
}) {
  const [variable, setVariable] = useState(currentVariable);
  const [debouncedCallback] = useDebouncedCallback(newVariable => {
    onUpdateVariables(newVariable);
  }, 200);

  function getCurrentResource(name, resource) {
    if (!name || !resource) return {};
    const currentResource = resource.find(s => s.metadata.name === name);
    return currentResource;
  }

  function getInitSecret() {
    const name =
      currentVariable.type === VARIABLE_TYPE.SECRET &&
      currentVariable?.valueFrom?.secretKeyRef?.name
        ? currentVariable?.valueFrom?.secretKeyRef?.name
        : null;
    return getCurrentResource(name, secrets);
  }

  function getInitConfigMap() {
    const name =
      currentVariable.type === VARIABLE_TYPE.CONFIG_MAP &&
      currentVariable?.valueFrom?.configMapKeyRef?.name
        ? currentVariable?.valueFrom?.configMapKeyRef?.name
        : null;
    return getCurrentResource(name, configmaps);
  }

  const [selectedSecret, setSelectedSecret] = useState(getInitSecret());
  const [selectedConfigMap, setSelectedConfigMap] = useState(
    getInitConfigMap(),
  );

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

  function onChangeValueFrom(valueFrom) {
    const newVariable = {
      ...variable,
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

    return (
      <td colSpan="3">
        <span className={className}>{message}</span> {/* TODO */}
      </td>
    );
  }

  const secretOptions = (secrets || []).map(({ metadata }) => ({
    key: metadata.name,
    text: metadata.name,
  }));

  let secretKeysOptions = Object.keys(selectedSecret.data || []).map(key => {
    return {
      key: key,
      text: key,
    };
  });

  const configmapOptions = (configmaps || []).map(({ metadata }) => ({
    key: metadata.name,
    text: metadata.name,
  }));

  const configmapKeysOptions = Object.keys(selectedConfigMap.data || []).map(
    key => {
      return {
        key: key,
        text: key,
      };
    },
  );

  return {
    cells: [
      <FormItem>
        <FormInput
          id={`variableName-${currentVariable.id}`}
          placeholder={ENVIRONMENT_VARIABLES_PANEL.PLACEHOLDERS.VARIABLE_NAME}
          type="text"
          value={variable.name}
          onChange={onChangeName}
        />
      </FormItem>,
      <span className="sap-icon--arrow-right"></span>,
      <FormItem style={{ maxWidth: '200px' }}>
        {currentVariable.type === VARIABLE_TYPE.CUSTOM && (
          <FormInput
            id={`variableValue-${currentVariable.id}`}
            placeholder={
              ENVIRONMENT_VARIABLES_PANEL.PLACEHOLDERS.VARIABLE_VALUE
            }
            type="text"
            value={variable.value}
            onChange={onChangeValue}
          />
        )}
        {currentVariable.type === VARIABLE_TYPE.SECRET && (
          <Dropdown
            id={`variableValueFromSecret-${currentVariable.id}`}
            options={secretOptions}
            onSelect={(_, selected) => {
              setSelectedSecret(getCurrentResource(selected.key, secrets));
              onChangeValueFrom({
                secretKeyRef: {
                  name: selected.key,
                  key: null,
                },
              });
            }}
            selectedKey={currentVariable?.valueFrom?.secretKeyRef?.name || null}
          />
        )}
        {currentVariable.type === VARIABLE_TYPE.CONFIG_MAP && (
          <Dropdown
            id={`variableValueFromConfigMap-${currentVariable.id}`}
            options={configmapOptions}
            onSelect={(_, selected) => {
              setSelectedConfigMap(
                getCurrentResource(selected.key, configmaps),
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
        )}
      </FormItem>,
      <InfoLabel>
        {ENVIRONMENT_VARIABLES_PANEL.VARIABLE_TYPE[currentVariable.type].TEXT}
      </InfoLabel>,
      <FormItem>
        {currentVariable.type === VARIABLE_TYPE.CUSTOM && <span>-</span>}
        {currentVariable.type === VARIABLE_TYPE.SECRET && selectedSecret && (
          <Dropdown
            id={`variableKeyFromSecret-${currentVariable.id}`}
            options={secretKeysOptions}
            onSelect={(_, selected) => {
              onChangeValueFrom({
                secretKeyRef: {
                  ...currentVariable.valueFrom.secretKeyRef,
                  key: selected.key,
                },
              });
            }}
            selectedKey={currentVariable?.valueFrom?.secretKeyRef?.key || null}
          />
        )}
        {currentVariable.type === VARIABLE_TYPE.CONFIG_MAP && (
          <Dropdown
            id={`variableKeyFromConfigMap-${currentVariable.id}`}
            options={configmapKeysOptions}
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
        )}
      </FormItem>,
    ],
    collapseContent: renderValidationContent(),
    withCollapseControl: false,
  };
}
