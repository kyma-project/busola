import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from 'fundamental-react';

import { useCreateRepository } from 'components/Lambdas/hooks';

import { ModalWithForm } from 'react-shared';
import RepositoryForm, { FORM_TYPE } from './RepositoryForm';

export function CreateRepositoryModal({
  repositoryNames = [],
  serverDataError = false,
  serverDataLoading = false,
}) {
  const createRepository = useCreateRepository();
  const [invalidModalPopupMessage, setInvalidModalPopupMessage] = useState('');
  const { t } = useTranslation();

  const modalOpeningComponent = (
    <Button
      glyph="add"
      option="transparent"
      disabled={Boolean(serverDataError || serverDataLoading)}
    >
      {t('functions.repositories-list.create.title')}
    </Button>
  );

  return (
    <ModalWithForm
      title={t('functions.repositories-list.create.title')}
      modalOpeningComponent={modalOpeningComponent}
      confirmText={t('functions.repositories-list.create.buttons.confirm')}
      invalidPopupMessage={invalidModalPopupMessage}
      id="create-repository-modal"
      className="repositories-list__create-repository-modal"
      renderForm={props => (
        <RepositoryForm
          {...props}
          onSubmitAction={createRepository}
          repositoryNames={repositoryNames}
          setInvalidModalPopupMessage={setInvalidModalPopupMessage}
          formType={FORM_TYPE.CREATE}
        />
      )}
    />
  );
}
