import React, { useState } from 'react';

import { ModalWithForm } from 'react-shared';

import VariableForm, { FORM_TYPE } from '../VariableForm/VariableForm';
import { VARIABLE_TYPE } from 'components/Lambdas/helpers/lambdaVariables';

export default function VariableModal({
  lambda,
  resources = [],
  customVariables,
  customValueFromVariables,
  injectedVariables,
  variable = null,
  type = VARIABLE_TYPE.CUSTOM,
  title,
  modalOpeningComponent,
  confirmText,
  alwaysOpen,
  onModalOpenStateChange,
  i18n,
  isEdit,
}) {
  const [invalidModalPopupMessage, setInvalidModalPopupMessage] = useState('');

  return (
    <ModalWithForm
      title={title}
      modalOpeningComponent={modalOpeningComponent}
      confirmText={confirmText}
      invalidPopupMessage={invalidModalPopupMessage}
      id="add-lambda-variables-modal"
      className="modal-size--l"
      onModalOpenStateChange={onModalOpenStateChange}
      alwaysOpen={alwaysOpen}
      renderForm={props => (
        <VariableForm
          {...props}
          lambda={lambda}
          resources={resources}
          variable={variable}
          type={type}
          customVariables={customVariables}
          customValueFromVariables={customValueFromVariables}
          injectedVariables={injectedVariables}
          setInvalidModalPopupMessage={setInvalidModalPopupMessage}
          formType={FORM_TYPE.CREATE}
          isEdit={isEdit}
        />
      )}
      i18n={i18n}
    />
  );
}
