import React, { useState, useRef } from 'react';

import { Button, FormItem } from 'fundamental-react';

import {
  K8sNameInput,
  useGetList,
  useMicrofrontendContext,
} from 'react-shared';
import { ENVIRONMENT_VARIABLES_PANEL } from 'components/Lambdas/constants';

export const FORM_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
};

export default function VariableForm({
  onChange,
  formElementRef,
  isValid = false,
  setValidity = () => void 0,
  setInvalidModalPopupMessage = () => void 0,
  lambda,
  currentVariable,
  variables,
  injectedVariables,
  sendRequest,
  onSubmitAction,
  requestType,
  saveButtonText,
  formType = FORM_TYPE.CREATE,
}) {
  const { namespaceId: namespace } = useMicrofrontendContext();

  const [name, setName] = useState(currentVariable?.name);
  const [value, setValue] = useState('c');

  const handleNameChanged = event => {
    setName(event.target.value);
  };
  function handleFormChanged(e) {}

  return (
    <div className="variable-form">
      <form
        onSubmit={e => e.preventDefault()}
        onChange={e => handleFormChanged(e)}
        ref={formElementRef}
        noValidate
      >
        <FormItem>
          <K8sNameInput
            onChange={handleNameChanged}
            id={`variableName-${currentVariable.id}`}
            kind="Variable"
            showHelp={!currentVariable?.name}
            defaultValue={currentVariable?.name}
            disabled={!!currentVariable?.name}
          />
        </FormItem>
      </form>
    </div>
  );
}
