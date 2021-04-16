import React, { useState } from 'react';

import { Button } from 'fundamental-react';

import ModalWithForm from 'components/ModalWithForm/ModalWithForm';
import CreateLambdaForm from './CreateLambdaForm';

import { LAMBDAS_LIST } from 'components/Lambdas/constants';

export default function CreateLambdaModal({
  functionNames = [],
  repositories = [],
  serverDataError,
  serverDataLoading,
  modalOpeningComponent,
}) {
  const [invalidModalPopupMessage, setInvalidModalPopupMessage] = useState('');

  const defaultModalOpeningComponent = (
    <Button
      glyph="add"
      option="transparent"
      disabled={Boolean(serverDataError || serverDataLoading)}
    >
      {LAMBDAS_LIST.CREATE_MODAL.OPEN_BUTTON.TEXT}
    </Button>
  );

  return (
    <ModalWithForm
      title={LAMBDAS_LIST.CREATE_MODAL.TITLE}
      modalOpeningComponent={
        modalOpeningComponent || defaultModalOpeningComponent
      }
      confirmText={LAMBDAS_LIST.CREATE_MODAL.CONFIRM_BUTTON.TEXT}
      invalidPopupMessage={invalidModalPopupMessage}
      id="create-lambda-modal"
      className="lambdas-list__create-lambda-modal"
      renderForm={props => (
        <CreateLambdaForm
          {...props}
          functionNames={functionNames}
          repositories={repositories}
          setInvalidModalPopupMessage={setInvalidModalPopupMessage}
        />
      )}
    />
  );
}
