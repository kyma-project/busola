import React, { useState } from 'react';

import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';

import VariableForm, { FORM_TYPE } from './VariableForm';
import { VARIABLE_TYPE } from 'components/Functions/helpers/functionVariables';

export default function VariableModal({
  func,
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
      id="add-func-variables-modal"
      onModalOpenStateChange={onModalOpenStateChange}
      alwaysOpen={alwaysOpen}
      renderForm={props => (
        <VariableForm
          {...props}
          func={func}
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
