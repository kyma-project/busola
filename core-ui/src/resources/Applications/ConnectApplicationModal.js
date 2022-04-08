import React from 'react';
import { Button } from 'fundamental-react';
import { Modal } from 'shared/components/Modal/Modal';
import { useDelete } from 'shared/hooks/BackendAPI/useMutation';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import copyToCliboard from 'copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import { useIsSKR } from './useIsSKR';

export default function ConnectApplication({ applicationName }) {
  const [url, setUrl] = React.useState();
  const { i18n, t } = useTranslation();

  const postRequest = usePost();
  const deleteTokenRequest = useDelete();
  const getRequest = useSingleGet();
  const isSKR = useIsSKR();

  async function performUrlFetch() {
    setUrl(t('common.headers.loading'));

    const defaultNamespace = 'default'; // just use the default namespace
    const path = `/apis/applicationconnector.kyma-project.io/v1alpha1/namespaces/${defaultNamespace}/tokenrequests`;
    const retries = 5;
    const delay = 1000;

    const tokenRequest = {
      apiVersion: 'applicationconnector.kyma-project.io/v1alpha1',
      kind: 'TokenRequest',
      metadata: { name: applicationName, namespace: defaultNamespace },
    };

    try {
      await deleteTokenRequest(path);
    } catch (_) {}

    try {
      postRequest(path, tokenRequest);
    } catch (e) {
      console.warn(e);
    }

    for (let i = 0; i < retries; i++) {
      try {
        const response = await getRequest(`${path}/${applicationName}`);
        const tokenRequest = await response.json();
        const { state, url } = tokenRequest.status || {};
        if (state === 'OK' && !!url) {
          setUrl(() => url);
          return;
        }
      } catch (e) {
        console.warn(e);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  let modalOpeningComponent = (
    <Button className="fd-margin-end--sm" disabled={isSKR}>
      {t('applications.buttons.connect')}
    </Button>
  );

  if (isSKR) {
    modalOpeningComponent = (
      <Tooltip delay={0} content={t('applications.messages.connect-disabled')}>
        {modalOpeningComponent}
      </Tooltip>
    );
  }

  return (
    <Modal
      onShow={performUrlFetch}
      actions={onClose => [
        <Button
          disabled={url === t('common.headers.loading')}
          option="emphasized"
          onClick={() => copyToCliboard(url)}
          key="copy"
        >
          {t('common.tooltips.copy-to-clipboard')}
        </Button>,
        <Button onClick={onClose} key="close">
          {t('common.buttons.close')}
        </Button>,
      ]}
      title={t('applications.subtitle.connect-app')}
      modalOpeningComponent={modalOpeningComponent}
      i18n={i18n}
    >
      <p className="fd-has-color-status-4 fd-has-font-style-italic">
        {t('applications.messages.copy-url')}
      </p>
      <textarea
        readOnly
        value={url}
        style={{ minHeight: '100px', width: '100%', marginTop: '0.5rem' }}
      />
    </Modal>
  );
}
