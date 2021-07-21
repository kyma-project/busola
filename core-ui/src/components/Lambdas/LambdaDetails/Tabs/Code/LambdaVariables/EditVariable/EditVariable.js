import React, { useState } from 'react';
import { Button } from 'fundamental-react';

import { ModalWithForm } from 'react-shared';

import { ENVIRONMENT_VARIABLES_PANEL } from 'components/Lambdas/constants';
import VariableForm, { FORM_TYPE } from '../VariableForm/VariableForm';

export default function EditVariable({
  lambda,
  customVariables,
  customValueFromVariables,
  type,
  variable,
}) {
  const [invalidModalPopupMessage, setInvalidModalPopupMessage] = useState('');
  const [currentVariable, setCurrentVariable] = useState(variable);

  // const { data: configmaps } = useGetList()(
  //   `/api/v1/namespaces/${lambda.metadata.namespace}/configmaps`,
  // );
  // const { data: secrets } = useGetList()(
  //   `/api/v1/namespaces/${lambda.metadata.namespace}/secrets`,
  // );

  const modalOpeningComponent = (
    <Button compact option="transparent" glyph="edit" />
  );
  const customVariableModal = (
    <ModalWithForm
      title="Edit Custom Variable"
      modalOpeningComponent={modalOpeningComponent}
      confirmText={ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.CONFIRM_BUTTON.TEXT}
      invalidPopupMessage={invalidModalPopupMessage}
      id="add-lambda-variables-modal"
      className="fd-dialog--xl-size modal-width--m"
      confirmText="Edit"
      renderForm={props => (
        <VariableForm
          {...props}
          lambda={lambda}
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

  return customVariableModal;
}
