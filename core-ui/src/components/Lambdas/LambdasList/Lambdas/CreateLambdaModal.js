import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from 'fundamental-react';

import { ModalWithForm } from 'react-shared';
import CreateLambdaForm from './CreateLambdaForm';

export default function CreateLambdaModal({
  repositories = [],
  serverDataError,
  serverDataLoading,
  modalOpeningComponent,
  i18n,
}) {
  const [invalidModalPopupMessage, setInvalidModalPopupMessage] = useState('');
  const { t } = useTranslation();

  const defaultModalOpeningComponent = (
    <Button
      glyph="add"
      option="transparent"
      disabled={Boolean(serverDataError || serverDataLoading)}
    >
      {t('functions.create-view.buttons.create')}
    </Button>
  );

  return (
    <ModalWithForm
      title={t('functions.create-view.buttons.create')}
      modalOpeningComponent={
        modalOpeningComponent || defaultModalOpeningComponent
      }
      confirmText={t('functions.create-view.buttons.confirm')}
      invalidPopupMessage={invalidModalPopupMessage}
      id="create-lambda-modal"
      className="lambdas-list__create-lambda-modal"
      renderForm={props => (
        <CreateLambdaForm
          {...props}
          repositories={repositories}
          setInvalidModalPopupMessage={setInvalidModalPopupMessage}
        />
      )}
      i18n={i18n}
    />
  );
}
