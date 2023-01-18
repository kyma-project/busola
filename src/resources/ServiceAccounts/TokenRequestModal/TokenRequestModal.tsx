import { Button, Dialog } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';

import { ComboboxInput } from 'shared/ResourceForm/inputs';
import './TokenRequestModal.scss';
import { useCreateTokenRequest } from './useCreateTokenRequest';

type TokenRequestModalProps = {
  isModalOpen: boolean;
  handleCloseModal: VoidFunction;
  namespace: string;
  serviceAccountName: string;
};

const expirationSecondsOptions = [
  {
    text: '1h(3600s)',
    key: 3600,
  },
  {
    text: '6h(21600s)',
    key: 21600,
  },
  {
    text: '1d(86400s)',
    key: 86400,
  },
  {
    text: '7d(604800s)',
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

  const actions = [
    <Button onClick={onCreateToken}>{t('common.buttons.create')}</Button>,
    <Button onClick={handleCloseModal}>{t('common.buttons.close')}</Button>,
  ];
  console.log(tokenRequest);
  return (
    <>
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
            simple
            required
            propertyPath="$.spec.expirationSeconds"
            label="Expiration Seconds"
            // value={tokenRequest.spec.expirationSeconds}
            input={(props: any) => (
              //@ts-ignore
              <ComboboxInput
                id="event-version-combobox"
                showAllEntries
                searchFullString
                selectionType="manual"
                required
                compact
                options={expirationSecondsOptions}
                selectedKey={props.value}
                typedValue={props.value}
                // onSelect={(e: any) => setValue(e.target.value)}
                //@ts-ignore
                onSelectionChange={(e, selected) => {
                  // console.log(e.target.value);
                  props.setValue(selected.key);
                }}
                {...props}

                // setValue={(e: any) =>
                //   setTokenRequest(tokenRequest => ({
                //     ...tokenRequest,
                //     spec: {
                //       expirationSeconds: e.target.value,
                //     },
                //   }))
                // }
                // setValue={setTokenRequest}
                // onSelectionChange={(_: any, selected: any) => {
                //   console.log(value);
                //   setTokenRequest(tokenRequest => ({
                //     ...tokenRequest,
                //     spec: {
                //       expirationSeconds: selected.key,
                //     },
                //   }));
                // }}
              />
            )}
          />

          {/*@ts-ignore*/}
        </ResourceForm.Single>
      </Dialog>
    </>
  );
};
