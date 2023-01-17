import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog } from 'fundamental-react';
import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';

import './TokenRequestModal.scss';
import { useCreateTokenRequest } from './useCreateTokenRequest';

type TokenRequestModalProps = {
  isModalOpen: boolean;
  handleCloseModal: VoidFunction;
  namespace: string;
  serviceAccountName: string;
};

export const TokenRequestModal = ({
  isModalOpen,
  handleCloseModal,
  namespace,
  serviceAccountName,
}: TokenRequestModalProps) => {
  const { t } = useTranslation();

  const {
    createTokenRequestFn,
    tokenRequest,
    setTokenRequest,
  } = useCreateTokenRequest(namespace, serviceAccountName);

  const onCreateToken = () => {
    createTokenRequestFn();
    handleCloseModal();
  };

  const actions = [
    <Button onClick={onCreateToken}>{t('common.buttons.create')}</Button>,
    <Button onClick={handleCloseModal}>{t('common.buttons.close')}</Button>,
  ];

  return (
    <>
      <Dialog
        show={isModalOpen}
        title={'Create Token Request'}
        actions={actions}
        className="token-request-modal"
      >
        {/*@ts-ignore*/}
        <ResourceForm.Single
          resource={tokenRequest}
          setResource={setTokenRequest}
        >
          {/*@ts-ignore*/}
          <ResourceForm.FormField
            input={Inputs.Number}
            propertyPath="$.spec.expirationSeconds"
            label="Expiration Seconds"
          />

          {/*@ts-ignore*/}
        </ResourceForm.Single>
      </Dialog>
    </>
  );
};
