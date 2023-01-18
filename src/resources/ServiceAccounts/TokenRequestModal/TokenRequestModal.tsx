import { Button, Dialog, MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';

import { ComboboxInput } from 'shared/ResourceForm/inputs';
import { useCreateTokenRequest } from './useCreateTokenRequest';
import './TokenRequestModal.scss';

type TokenRequestModalProps = {
  isModalOpen: boolean;
  handleCloseModal: VoidFunction;
  namespace: string;
  serviceAccountName: string;
};

const SEVEN_DAYS_IN_SECONDS = 604800;

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

  const {
    createTokenRequestFn,
    tokenRequest,
    setTokenRequest,
  } = useCreateTokenRequest(namespace, serviceAccountName);

  const onCreateToken = () => {
    createTokenRequestFn();
    handleCloseModal();
  };

  const isExpirationSecondsValueANumber = () => {
    console.log(!!Number(tokenRequest.spec.expirationSeconds));
    return !Number(tokenRequest.spec.expirationSeconds);
  };

  const actions = [
    <Button
      onClick={onCreateToken}
      disabled={isExpirationSecondsValueANumber()}
    >
      {t('common.buttons.create')}
    </Button>,
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
          pattern="\d*"
          simple
          required
          propertyPath="$.spec.expirationSeconds"
          label={t('service-accounts.token-request.expiration-seconds')}
          input={({
            value,
            setValue,
          }: {
            value: number;
            setValue: (value: number | string) => void;
          }) => (
            //@ts-ignore
            <ComboboxInput
              id="event-version-combobox"
              showAllEntries
              searchFullString
              selectionType="manual"
              required
              compact
              options={expirationSecondsOptions}
              selectedKey={value}
              typedValue={value}
              //@ts-ignore
              onSelectionChange={(
                e: React.ChangeEvent<HTMLInputElement>,
                selected: { key: string; value: number },
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
        {tokenRequest.spec.expirationSeconds >= SEVEN_DAYS_IN_SECONDS && (
          <MessageStrip
            type="warning"
            className="fd-margin-end--lg fd-margin-begin--lg"
          >
            Be careful
          </MessageStrip>
        )}
        {/*@ts-ignore*/}
      </ResourceForm.Single>
    </Dialog>
  );
};
