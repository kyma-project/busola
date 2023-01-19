import { Button, Dialog, MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';

import { useCreateKubeconfig } from 'hooks/useCreateKubeconfig';
import { useCallback } from 'react';
import { ComboboxInput } from 'shared/ResourceForm/inputs';
import { useDownloadKubeconfigWithToken } from '../useDownloadKubeconfigWithToken';
import { useGenerateTokenRequest } from './useGenerateTokenRequest';

import './TokenRequestModal.scss';

type TokenRequestModalProps = {
  isModalOpen: boolean;
  handleCloseModal: VoidFunction;
  namespace: string;
  serviceAccountName: string;
};

const expirationSecondsOptions = [
  {
    text: '3600s (1h)',
    key: 3600,
  },
  {
    text: '21600s (6h)',
    key: 21600,
  },
  {
    text: '86400s (1d)',
    key: 86400,
  },
  {
    text: '604800s (7d)',
    key: 604800,
  },
];

export const TokenRequestModal = ({
  isModalOpen,
  handleCloseModal,
  namespace,
  serviceAccountName,
}: TokenRequestModalProps) => {
  const { t } = useTranslation();
  const downloadKubeconfig = useDownloadKubeconfigWithToken();
  const createKubeconfig = useCreateKubeconfig();

  const {
    token,
    generateTokenRequest,
    tokenRequest,
    setTokenRequest,
  } = useGenerateTokenRequest(namespace, serviceAccountName);

  const isExpirationSecondsValueANumber = useCallback(() => {
    return !Number(tokenRequest.spec.expirationSeconds);
  }, [tokenRequest.spec.expirationSeconds]);

  const actions = [
    <Button onClick={handleCloseModal}>{t('common.buttons.close')}</Button>,
  ];

  return (
    <Dialog
      show={isModalOpen}
      title={t('service-accounts.token-request.create')}
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
          inputInfo={t('service-accounts.token-request.input-info')}
          simple
          required
          propertyPath="$.spec.expirationSeconds"
          label={t('service-accounts.token-request.expiration-seconds')}
          input={({
            value,
            setValue,
          }: {
            value: number;
            setValue: (value: number) => void;
          }) => (
            //@ts-ignore
            <ComboboxInput
              id="event-version-combobox"
              showAllEntries
              searchFullString
              selectionType="manual"
              required
              options={expirationSecondsOptions}
              selectedKey={value}
              typedValue={value}
              onSelectionChange={(
                e: React.ChangeEvent<HTMLInputElement>,
                selected: { key: number; text: string },
              ) => {
                if (e?.target?.value) {
                  setValue(Number(e.target.value));
                } else {
                  setValue(selected.key);
                }
              }}
            />
          )}
        />
        <MessageStrip
          type="warning"
          className="fd-margin-end--lg fd-margin-begin--lg fd-margin-top--sm"
        >
          {t('service-accounts.token-request.warning')}
        </MessageStrip>
        {/*@ts-ignore*/}
      </ResourceForm.Single>
    </Dialog>
  );
};
