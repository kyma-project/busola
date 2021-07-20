import React, { useState, useEffect } from 'react';

import { Popover, Menu, Button } from 'fundamental-react';
import { GenericList } from 'react-shared';

import SingleVariableInput from './SingleVariableInput';

import { useUpdateLambda, UPDATE_TYPE } from 'components/Lambdas/hooks';
import {
  newVariableModel,
  VARIABLE_TYPE,
  ERROR_VARIABLE_VALIDATION,
} from 'components/Lambdas/helpers/lambdaVariables';
import { ENVIRONMENT_VARIABLES_PANEL } from 'components/Lambdas/constants';

import { validateVariables } from './validation';

const headerRenderer = () => ['Variable Name', '', 'Value', 'Source', 'Key'];
const textSearchProperties = ['name', 'value', 'type'];

export default function EditVariablesForm({
  lambda,
  configmaps = [],
  secrets = [],
  customVariables = [],
  customValueFromVariables = [],
  injectedVariables = [],
  onChange,
  formElementRef,
  setValidity = () => void 0,
  setCustomValid = () => void 0,
  setInvalidModalPopupMessage = () => void 0,
}) {
  const updateLambdaVariables = useUpdateLambda({
    lambda,
    type: UPDATE_TYPE.VARIABLES,
  });
  const [variables, setVariables] = useState(
    validateVariables(
      [...customVariables, ...customValueFromVariables],
      injectedVariables,
    ),
  );

  useEffect(() => {
    // in case when custom variables are defined, user should have possibility to delete them
    // otherwise show message, that at least one env must be defined to make changes on Function CR
    if (
      !variables.length &&
      !customVariables.length &&
      !customValueFromVariables.length
    ) {
      setValidity(false);
      setInvalidModalPopupMessage(
        ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.CONFIRM_BUTTON.POPUP_MESSAGES
          .NO_ENVS_DEFINED,
      );
      return;
    }

    // check if some variable has error validation - warnings are allowed
    const hasError = variables.some(v =>
      ERROR_VARIABLE_VALIDATION.includes(v.validation),
    );
    if (hasError) {
      setValidity(false);
      setInvalidModalPopupMessage(
        ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.CONFIRM_BUTTON.POPUP_MESSAGES
          .ERROR,
      );
      return;
    }

    setInvalidModalPopupMessage('');
  }, [
    setValidity,
    variables,
    customVariables,
    customValueFromVariables,
    setInvalidModalPopupMessage,
  ]);

  function onUpdateVariables(variable) {
    let newVariables = variables.map(oldVariable => {
      if (oldVariable.id === variable.id) {
        return {
          ...oldVariable,
          ...variable,
        };
      }
      return oldVariable;
    });

    newVariables = validateVariables(newVariables, injectedVariables);
    setVariables(newVariables);
  }

  function onDeleteVariables(variable) {
    let newVariables = variables.filter(
      oldVariable => oldVariable.id !== variable.id,
    );
    newVariables = validateVariables(newVariables, injectedVariables);
    setVariables(newVariables);
  }

  function prepareVariablesInput() {
    return variables.map(variable => {
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

  function handleFormSubmit(e) {
    e.preventDefault();
    const preparedVariable = prepareVariablesInput();
    updateLambdaVariables({
      spec: {
        ...lambda.spec,
        env: [...preparedVariable],
      },
    });
  }

  const actions = [
    {
      name: 'Delete',
      handler: variable => onDeleteVariables(variable),
    },
  ];
  const rowRenderer = variable =>
    SingleVariableInput({
      currentVariable: variable,
      variables,
      injectedVariables,
      configmaps,
      secrets,
      onUpdateVariables,
      setValidity,
      setCustomValid,
      setInvalidModalPopupMessage,
    });

  function addNewVariable(type = 'CUSTOM') {
    setVariables(vars => [
      newVariableModel({
        type: VARIABLE_TYPE[type],
        additionalProps: { dirty: false },
      }),
      ...vars,
    ]);
  }

  const variableTypeButton = (type = 'CUSTOM') => (
    <Button
      typeAttr="button"
      data-testid="add-custom-variable"
      onClick={() => addNewVariable(type)}
    >
      {VARIABLE_TYPE[type]}
    </Button>
  );

  const addNewVariableButton = (
    <Button glyph="add" typeAttr="button">
      {ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.ADD_ENV_BUTTON.TEXT}
    </Button>
  );

  const addNewVariableDropdown = (
    <Popover
      body={
        <Menu>
          <Menu.List>
            <Menu.Item>{variableTypeButton()}</Menu.Item>
            <Menu.Item>{variableTypeButton('CONFIG_MAP')}</Menu.Item>
            <Menu.Item>{variableTypeButton('SECRET')}</Menu.Item>
          </Menu.List>
        </Menu>
      }
      control={addNewVariableButton}
      widthSizingType="matchTarget"
      placement="bottom-end"
    />
  );

  return (
    <form
      ref={formElementRef}
      onSubmit={handleFormSubmit}
      onChange={onChange}
      className="edit-lambda-variables-form"
      noValidate
    >
      <GenericList
        entries={variables}
        textSearchProperties={textSearchProperties}
        extraHeaderContent={addNewVariableDropdown}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        actions={actions}
        showSearchField={true}
        showSearchSuggestion={false}
        hasExternalMargin={false}
        notFoundMessage={
          ENVIRONMENT_VARIABLES_PANEL.LIST.ERRORS.RESOURCES_NOT_FOUND
        }
        noSearchResultMessage={
          ENVIRONMENT_VARIABLES_PANEL.LIST.ERRORS.NOT_MATCHING_SEARCH_QUERY
        }
      />
    </form>
  );
}
