import React, { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  ComboboxInput,
  FormItem,
  FormInput,
  FormLabel,
  MessageStrip,
} from 'fundamental-react';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';

import {
  ALL_KEYS,
  VARIABLE_TYPE,
  VARIABLE_VALIDATION,
} from 'components/Lambdas/helpers/lambdaVariables';
import { CONFIG } from 'components/Lambdas/config';

import { getValidationStatus, validateVariable } from '../validation';
import { useTranslation } from 'react-i18next';
import './VariableInputs.scss';

export default function ResourceVariableInput({
  currentVariable = {},
  variables = [],
  resources = [],
  injectedVariables = [],
  onUpdateVariable,
  setValidity,
  setInvalidModalPopupMessage,
  isEdit,
}) {
  const { t, i18n } = useTranslation();
  const [variable, setVariable] = useState(currentVariable);
  const debouncedCallback = useDebouncedCallback(newVariable => {
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
  const [takeAll, setTakeAll] = useState(false);

  useEffect(() => {
    setValidity(false);
  }, [setValidity]);

  useEffect(() => {
    setVariable(currentVariable);
  }, [currentVariable]);

  useEffect(() => {
    const validate = validateVariable(variables, variable);
    setValidity(validate && variable.validation === VARIABLE_VALIDATION.NONE);
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
      varType: variable.type,
      varValue: variable.valueFrom,
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
      resources,
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
        message = t('functions.variable.errors.empty');
        break;
      case VARIABLE_VALIDATION.INVALID:
        className = 'fd-has-color-status-3';
        message = t('functions.variable.errors.invalid');
        break;
      case VARIABLE_VALIDATION.INVALID_SECRET:
        className = 'fd-has-color-status-3';
        message = t('functions.variable.errors.invalid-secret');
        break;
      case VARIABLE_VALIDATION.INVALID_CONFIG:
        className = 'fd-has-color-status-3';
        message = t('functions.variable.errors.invalid-config');
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
        className = 'fd-has-color-status-3';
        message = validation;
        break;
    }
    return <span className={className}>{message}</span>;
  }

  const resourceOptions = (resources || []).map(({ metadata }) => ({
    key: metadata.name,
    text: metadata.name,
  }));

  const resourceKeysOptions = Object.keys(selectedResource?.data || []).map(
    key => ({
      key: key,
      text: key,
    }),
  );
  if (!isEdit && resourceKeysOptions.length > 1) {
    resourceKeysOptions.unshift({
      key: ALL_KEYS,
      text: t('functions.variable.form.all-keys'),
    });
  }

  return (
    <div className="resource-variable-form">
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

      {currentVariable.type === VARIABLE_TYPE.SECRET && (
        <>
          <FormItem className="grid-input-fields">
            <FormLabel required={true}>
              {t('functions.variable.form.secret')}
            </FormLabel>
            <ComboboxInput
              showAllEntries
              searchFullString
              selectionType="manual"
              required
              id={`variableValueFromSecret-${currentVariable.id}`}
              options={resourceOptions}
              onSelectionChange={(_, selected) => {
                setSelectedResource(
                  getCurrentResource(selected?.key, resources),
                );
                onChangeValueFrom({
                  secretKeyRef: {
                    name: selected?.key,
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
            <FormLabel required={true}>
              {t('functions.variable.form.key')}
            </FormLabel>
            <Dropdown
              id={`variableKeyFromSecret-${currentVariable.id}`}
              options={resourceKeysOptions}
              onSelect={(_, selected) => {
                setTakeAll(selected.key === ALL_KEYS);
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
              i18n={i18n}
            />
          </FormItem>
          {takeAll && (
            <MessageStrip className="fd-margin-top--sm" type="information">
              {t('functions.variable.form.take-all-description')}
            </MessageStrip>
          )}
        </>
      )}

      {currentVariable.type === VARIABLE_TYPE.CONFIG_MAP && (
        <>
          <FormItem className="grid-input-fields">
            <FormLabel required={true}>
              {t('functions.variable.form.config-map')}
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
              i18n={i18n}
            />
          </FormItem>
          <FormItem className="grid-input-fields">
            <FormLabel required={true}>
              {t('functions.variable.form.key')}
            </FormLabel>
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
              i18n={i18n}
            />
          </FormItem>
        </>
      )}
    </div>
  );
}
