import { Button, MessageStrip, Dialog, Bar } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { useGenerateTokenRequest } from './useGenerateTokenRequest';
import { useDownloadKubeconfigWithToken } from '../useDownloadKubeconfigWithToken';
import { ResourceForm } from 'shared/ResourceForm';
import { ComboboxInput } from 'shared/ResourceForm/inputs';
import { CopiableText } from 'shared/components/CopiableText/CopiableText';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';

import { useEventListener } from 'hooks/useEventListener';

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
      required
      options={expirationSecondsOptions}
      selectedKey={value}
      onSelectionChange={(
        _: any,
        selected: { key: number; text: string },
      ): void => {
        setValue(selected.key);
      }}
    />
  );
};

type TokenRequestModalProps = {
  handleCloseModal: VoidFunction;
  namespace: string;
  serviceAccountName: string;
};

export function TokenRequestModal({
  handleCloseModal,
  namespace,
  serviceAccountName,
}: TokenRequestModalProps) {
  const { t } = useTranslation();
  const downloadKubeconfig = useDownloadKubeconfigWithToken();

  const {
    kubeconfigYaml,
    token,
    generateTokenRequest,
    tokenRequest,
    setTokenRequest,
  } = useGenerateTokenRequest(namespace, serviceAccountName);

  const isExpirationSecondsValueANumber = () =>
    !Number(tokenRequest.spec.expirationSeconds);

  const handleCloseWithEscape = (e: Event) => {
    if ((e as KeyboardEvent).key === 'Escape') handleCloseModal();
  };

  useEventListener('keydown', handleCloseWithEscape);

  return (
    <Dialog
      open
      onAfterClose={handleCloseModal}
      headerText={t('service-accounts.token-request.generate')}
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
          <MessageStrip design="Warning" hideCloseButton>
            {t('service-accounts.token-request.warning')}
          </MessageStrip>
          <div
            className="fd-display-flex fd-margin-top--sm fd-margin-bottom--sm"
            style={{
              justifyContent: 'flex-end',
            }}
          >
            {/*@ts-ignore*/}
            <CopiableText
              iconOnly
              buttonText={t('common.buttons.copy')}
              className="fd-margin-end--tiny"
              textToCopy={kubeconfigYaml}
              disabled={token === ''}
            />
            <Button
              onClick={() => downloadKubeconfig(serviceAccountName, token)}
              disabled={token === ''}
              design="Transparent"
              className="fd-margin-end--tiny"
              icon="download"
              iconEnd
            >
              {t('service-accounts.headers.download-kubeconfig')}
            </Button>
            <Button
              onClick={generateTokenRequest}
              disabled={isExpirationSecondsValueANumber()}
            >
              {t('common.buttons.generate-name')}
            </Button>
          </div>
          {/*@ts-ignore*/}
          <Editor
            value={kubeconfigYaml}
            updateValueOnParentChange
            readOnly
            autocompletionDisabled
            height="50vh"
            language="yaml"
          />
        </div>
        {/*@ts-ignore*/}
      </ResourceForm.Single>
    </Dialog>
  );
}
