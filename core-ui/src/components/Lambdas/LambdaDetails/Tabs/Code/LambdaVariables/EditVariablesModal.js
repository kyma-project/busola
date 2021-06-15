import React, { useState } from 'react';

import { Button } from 'fundamental-react';

import { ModalWithForm } from 'react-shared';
import { ENVIRONMENT_VARIABLES_PANEL } from 'components/Lambdas/constants';

import EditVariablesForm from './EditVariablesForm';

export default function EditVariablesModal({
  lambda,
  customVariables,
  customValueFromVariables,
  injectedVariables,
}) {
  const [invalidModalPopupMessage, setInvalidModalPopupMessage] = useState('');

  const modalOpeningComponent = (
    <Button glyph="edit" option="transparent">
      {ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.OPEN_BUTTON.TEXT}
    </Button>
  );

  return (
    <ModalWithForm
      title={ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.TITLE}
      modalOpeningComponent={modalOpeningComponent}
      confirmText={ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.CONFIRM_BUTTON.TEXT}
      invalidPopupMessage={invalidModalPopupMessage}
      id="add-lambda-variables-modal"
      className="fd-dialog--xl-size modal--no-padding modal-width--m"
      renderForm={props => (
        <EditVariablesForm
          {...props}
          lambda={lambda}
          customVariables={customVariables}
          customValueFromVariables={customValueFromVariables}
          injectedVariables={injectedVariables}
          setInvalidModalPopupMessage={setInvalidModalPopupMessage}
        />
      )}
    />
  );
}
