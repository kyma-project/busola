import React from 'react';
import { Button } from 'fundamental-react';
import { Modal, usePost, useDelete, useSingleGet } from 'react-shared';
import copyToCliboard from 'copy-to-clipboard';

function Actions({ close, textToCopy, canCopy }) {
  return [
    <Button
      disabled={!canCopy}
      option="emphasized"
      onClick={() => copyToCliboard(textToCopy)}
      key="copy"
    >
      Copy to clipboard
    </Button>,
    <Button onClick={close} key="close">
      Close
    </Button>,
  ];
}

export default function ConnectApplicationModal({ applicationName }) {
  const [url, setUrl] = React.useState();

  const postRequest = usePost();
  const deleteTokenRequest = useDelete();
  const getRequest = useSingleGet();

  async function performUrlFetch() {
    setUrl('Loading...');

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

  return (
    <Modal
      onShow={performUrlFetch}
      actions={onClose => (
        <Actions
          close={onClose}
          textToCopy={url}
          canCopy={url !== 'Loading...'}
        />
      )}
      title="Connect Application"
      modalOpeningComponent={
        <Button className="fd-margin-end--sm">Connect Application</Button>
      }
    >
      <p className="fd-has-color-status-4 fd-has-font-style-italic">
        Copy the following URL and use it at the external system that you would
        like to connect to:
      </p>
      <textarea
        readOnly
        value={url}
        style={{ minHeight: '100px', width: '100%', marginTop: '0.5rem' }}
      />
    </Modal>
  );
}
