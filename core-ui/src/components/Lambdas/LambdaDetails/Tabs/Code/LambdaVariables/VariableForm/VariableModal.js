import React, { useState } from 'react';

import { ModalWithForm } from 'react-shared';

import VariableForm, { FORM_TYPE } from '../VariableForm/VariableForm';
import {
  VARIABLE_TYPE,
  newVariableModel,
} from 'components/Lambdas/helpers/lambdaVariables';

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
export default function VariableModal({
  lambda,
  resources = [],
  customVariables,
  customValueFromVariables,
  variable = null,
  type = VARIABLE_TYPE.CUSTOM,
  title,
  modalOpeningComponent,
  confirmText,
}) {
  const [invalidModalPopupMessage, setInvalidModalPopupMessage] = useState('');

  const [currentVariable, setCurrentVariable] = useState(
    variable || newVariableModel(EMPTY_VARIABLE[type]),
  );
  return (
    <ModalWithForm
      title={title}
      modalOpeningComponent={modalOpeningComponent}
      confirmText={confirmText}
      invalidPopupMessage={invalidModalPopupMessage}
      id="add-lambda-variables-modal"
      className="fd-dialog--xl-size modal-width--m"
      renderForm={props => (
        <VariableForm
          {...props}
          lambda={lambda}
          resources={resources}
          currentVariable={currentVariable}
          setCurrentVariable={setCurrentVariable}
          customVariables={customVariables}
          customValueFromVariables={customValueFromVariables}
          setInvalidModalPopupMessage={setInvalidModalPopupMessage}
          formType={FORM_TYPE.CREATE}
        />
      )}
    />
  );
}
