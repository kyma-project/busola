import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog } from 'fundamental-react';
import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';

import './TokenRequestModal.scss';

type TokenRequestModalProps = {
  isModalOpen: boolean;
  handleCloseModal: VoidFunction;
};

const creaTokenRequestTemplate = () => {
  return {
    apiVersion: 'authentication.k8s.io/v1',
    kind: 'TokenRequest',
    spec: {
      expirationSeconds: 3600,
    },
  };
};

export const TokenRequestModal = ({
  isModalOpen,
  handleCloseModal,
}: TokenRequestModalProps) => {
  const { t } = useTranslation();
  const [tokenRequest, setTokenRequest] = useState(creaTokenRequestTemplate());

  const actions = [
    <Button onClick={() => {}}>{t('common.buttons.create')}</Button>,
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
