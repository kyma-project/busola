import { Button, Dialog, MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';

import { useCreateKubeconfig } from 'hooks/useCreateKubeconfig';
import { useCallback } from 'react';
import { ComboboxInput } from 'shared/ResourceForm/inputs';
import { useDownloadKubeconfigWithToken } from '../useDownloadKubeconfigWithToken';
import { useGenerateTokenRequest } from './useGenerateTokenRequest';

import './TokenRequestModal.scss';
import { CopiableText } from 'shared/components/CopiableText/CopiableText';
import jsyaml from 'js-yaml';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';

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

const ComboboxInputWithSeconds = ({
  value,
  setValue,
}: {
  value: number;
  setValue: (value: number) => void;
}) => {
  return (
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
  );
};

type TokenRequestModalProps = {
  handleCloseModal: VoidFunction;
  namespace: string;
  serviceAccountName: string;
};

export const TokenRequestModal = ({
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
      show
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
          inputInfo={t('service-accounts.token-request.input-info')}
          label={t('service-accounts.token-request.expiration-seconds')}
          input={ComboboxInputWithSeconds}
        />
        <div className="fd-margin-end--lg fd-margin-begin--lg fd-margin-top--sm">
          <MessageStrip type="warning">
            {t('service-accounts.token-request.warning')}
          </MessageStrip>
          <div className="fd-display-flex fd-justify-between fd-margin-top--sm fd-margin-bottom--sm">
            <Button
              onClick={generateTokenRequest}
              disabled={isExpirationSecondsValueANumber()}
            >
              {t('common.buttons.generate-name')}
            </Button>
            <div className="fd-display-flex">
              {/*@ts-ignore*/}
              <CopiableText
                iconOnly
                buttonText="Copy"
                className="fd-margin-end--tiny"
                textToCopy={jsyaml.dump(
                  createKubeconfig(serviceAccountName, token),
                )}
              />
              <Button
                onClick={() => downloadKubeconfig(serviceAccountName, token)}
              >
                Download Kubeconfig
              </Button>
            </div>
          </div>
          {/*@ts-ignore*/}
          {token && (
            //@ts-ignore
            <Editor
              value={jsyaml.dump(createKubeconfig(serviceAccountName, token))}
              readOnly
              autocompletionDisabled
              height="50vh"
              language="yaml"
            />
          )}
        </div>
        {/*@ts-ignore*/}
      </ResourceForm.Single>
    </Dialog>
  );
};
