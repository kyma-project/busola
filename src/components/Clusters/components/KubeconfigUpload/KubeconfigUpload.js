import React, { useCallback } from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { KubeconfigFileUpload } from './KubeconfigFileUpload';
import jsyaml from 'js-yaml';

import { spacing } from '@ui5/webcomponents-react-base';
import './KubeconfigUpload.scss';
import { ClusterDataForm } from 'components/Clusters/views/EditCluster/EditCluster';

export function KubeconfigUpload({ kubeconfig, setKubeconfig, formRef }) {
  const [error, setError] = React.useState('');

  const { t } = useTranslation();

  const updateKubeconfig = useCallback(
    text => {
      try {
        const config = jsyaml.load(text);

        if (typeof config !== 'object') {
          setError(t('clusters.wizard.not-an-object'));
        } else {
          setKubeconfig(config);

          setError(null);
        }
      } catch ({ message }) {
        // get the message until the newline
        setError(message.substr(0, message.indexOf('\n')));
      }
    },
    [t, setError, setKubeconfig],
  );

  return (
    <div className="kubeconfig-upload">
      <div className="add-cluster__content-container">
        <KubeconfigFileUpload
          onKubeconfigTextAdded={text => {
            updateKubeconfig(text);
          }}
        />
      </div>
      <ClusterDataForm
        kubeconfig={kubeconfig}
        setResource={modified => {
          if (modified) setKubeconfig({ ...modified });
        }}
        onChange={updateKubeconfig}
        formElementRef={formRef}
        modeSelectorDisabled={
          kubeconfig ? !Object.keys(kubeconfig)?.length : !!!kubeconfig
        }
        initialMode={'MODE_YAML'}
        className="kubeconfig-upload__form add-cluster__content-container"
        yamlSearchDisabled={true}
        yamlHideDisabled={true}
      />
      {error && (
        <MessageStrip
          design="Negative"
          hideCloseButton
          style={spacing.sapUiSmallMarginTop}
        >
          {t('common.create-form.editor-error', { error })}
        </MessageStrip>
      )}
    </div>
  );
}
