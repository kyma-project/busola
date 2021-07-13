import React, { useState } from 'react';

import { Button } from 'fundamental-react';

import { ModalWithForm, useGetList } from 'react-shared';
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

  const { data: configmaps } = useGetList()(
    `/api/v1/namespaces/${lambda.metadata.namespace}/configmaps`,
  );
  const { data: secrets } = useGetList()(
    `/api/v1/namespaces/${lambda.metadata.namespace}/secrets`,
  );
  return (
    <ModalWithForm
      title={ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.TITLE}
      modalOpeningComponent={modalOpeningComponent}
      confirmText={ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.CONFIRM_BUTTON.TEXT}
      invalidPopupMessage={invalidModalPopupMessage}
      id="add-lambda-variables-modal"
      className="fd-dialog--xl-size modal-width--l modal--no-padding"
      renderForm={props => (
        <EditVariablesForm
          {...props}
          lambda={lambda}
          configmaps={configmaps}
          secrets={secrets}
          customVariables={customVariables}
          customValueFromVariables={customValueFromVariables}
          injectedVariables={injectedVariables}
          setInvalidModalPopupMessage={setInvalidModalPopupMessage}
        />
      )}
    />
  );
}
