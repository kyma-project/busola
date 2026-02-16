import { useTranslation } from 'react-i18next';
import { useGenerateTokenRequest } from './useGenerateTokenRequest';
import { useDownloadKubeconfigWithToken } from '../useDownloadKubeconfigWithToken';
import { useEventListener } from 'hooks/useEventListener';

import { Button, MessageStrip, Dialog, Bar } from '@ui5/webcomponents-react';
import { ResourceForm } from 'shared/ResourceForm';
import { ComboboxInput } from 'shared/ResourceForm/inputs';
import { CopiableText } from 'shared/components/CopiableText/CopiableText';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import { useRef } from 'react';

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
  generateTokenRequest,
}: {
  value: number;
  setValue: (value: number) => void;
  generateTokenRequest: () => void;
}) => {
  return (
    //@ts-expect-error Mismatch between js and ts
    <ComboboxInput
      id="event-version-combobox"
      required
      updatesOnInput={false}
      options={expirationSecondsOptions}
      selectedKey={value}
      onSelectionChange={(
        _: CustomEvent,
        selected: { key: number; text: string },
      ): void => {
        setValue(selected.key);
        generateTokenRequest();
      }}
    />
  );
};

type TokenRequestModalProps = {
  isModalOpen: boolean;
  handleCloseModal: VoidFunction;
  namespace: string;
  serviceAccountName: string;
};

export function TokenRequestModal({
  isModalOpen,
  handleCloseModal,
  namespace,
  serviceAccountName,
}: TokenRequestModalProps) {
  const { t } = useTranslation();
  const downloadKubeconfig = useDownloadKubeconfigWithToken();
  const modalRef = useRef(null);

  const {
    kubeconfigYaml,
    token,
    generateTokenRequest,
    tokenRequest,
    setTokenRequest,
  } = useGenerateTokenRequest(
    isModalOpen,
    namespace,
    serviceAccountName,
    modalRef,
  );

  const isExpirationSecondsValueANumber = () =>
    !Number(tokenRequest.spec.expirationSeconds);

  const handleCloseWithEscape = (e: Event) => {
    if ((e as KeyboardEvent).key === 'Escape') handleCloseModal();
  };

  useEventListener('keydown', handleCloseWithEscape);

  const handleGenerateTokenRequest = () => {
    if (!isExpirationSecondsValueANumber()) {
      generateTokenRequest();
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onClose={handleCloseModal}
      headerText={t('service-accounts.token-request.generate')}
      ref={modalRef}
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button onClick={handleCloseModal}>
                {t('common.buttons.close')}
              </Button>
            </>
          }
        />
      }
    >
      <ResourceForm.Single
        resource={tokenRequest}
        setResource={setTokenRequest}
      >
        <ResourceForm.FormField
          required
          propertyPath="$.spec.expirationSeconds"
          inputInfo={t('service-accounts.token-request.input-info')}
          label={t('service-accounts.token-request.expiration-seconds')}
          input={(
            props: JSX.IntrinsicAttributes & {
              value: number;
              setValue: (value: number) => void;
              generateTokenRequest: () => void;
            },
          ) => (
            <ComboboxInputWithSeconds
              {...props}
              generateTokenRequest={handleGenerateTokenRequest}
            />
          )}
        />
        <div className="sap-margin-top-small">
          <MessageStrip design="Critical" hideCloseButton>
            {t('service-accounts.token-request.warning')}
          </MessageStrip>
          <div
            className="bsl-display-flex sap-margin-y-small"
            style={{
              justifyContent: 'flex-end',
            }}
          >
            <CopiableText
              iconOnly
              buttonText={t('common.buttons.copy')}
              textToCopy={kubeconfigYaml}
              disabled={token === ''}
            />
            <Button
              onClick={() => downloadKubeconfig(serviceAccountName, token)}
              disabled={token === ''}
              design="Transparent"
              className="sap-margin-end-tiny"
              endIcon="download"
            >
              {t('service-accounts.headers.download-kubeconfig')}
            </Button>
          </div>
          {/*@ts-expect-error Type mismatch between js and ts */}
          <Editor
            value={kubeconfigYaml}
            updateValueOnParentChange
            readOnly
            autocompletionDisabled
            height="50vh"
            language="yaml"
          />
        </div>
      </ResourceForm.Single>
    </Dialog>
  );
}
