import { useState, useCallback, RefObject } from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { KubeconfigFileUpload } from './KubeconfigFileUpload';
import jsyaml from 'js-yaml';
import { ClusterDataForm } from 'components/Clusters/views/EditCluster/EditCluster';
import { Kubeconfig, ValidKubeconfig } from 'types';

import './KubeconfigUpload.scss';

type KubeconfigUploadProps = {
  kubeconfig?: Kubeconfig;
  setKubeconfig: (config?: Kubeconfig) => void;
  formRef: RefObject<HTMLElement>;
};

export function KubeconfigUpload({
  kubeconfig,
  setKubeconfig,
  formRef,
}: KubeconfigUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const { t } = useTranslation();

  const updateKubeconfig = useCallback(
    (text: string) => {
      try {
        const config = jsyaml.load(text);

        if (typeof config !== 'object') {
          setError(t('clusters.wizard.not-an-object'));
        } else {
          setKubeconfig(config as Kubeconfig);

          setError(null);
        }
      } catch (e) {
        const message = (e as Error)?.message;
        // get the message until the newline
        setError(message.slice(0, message.indexOf('\n')));
      }
    },
    [t, setError, setKubeconfig],
  );

  return (
    <div className="kubeconfig-upload">
      <div className="add-cluster__content-container sap-margin-bottom-small">
        <KubeconfigFileUpload
          onKubeconfigTextAdded={(text) => {
            updateKubeconfig(text);
          }}
        />
      </div>
      <ClusterDataForm
        kubeconfig={kubeconfig as ValidKubeconfig}
        setResource={(modified: Kubeconfig) => {
          if (modified) setKubeconfig({ ...modified });
        }}
        formElementRef={formRef}
        modeSelectorDisabled={
          kubeconfig ? !Object.keys(kubeconfig)?.length : !kubeconfig
        }
        initialMode={'MODE_YAML'}
        className="kubeconfig-upload__form add-cluster__content-container"
        yamlSearchDisabled
        yamlHideDisabled
      />
      {error && (
        <MessageStrip design="Negative" hideCloseButton>
          {t('common.create-form.editor-error', { error })}
        </MessageStrip>
      )}
    </div>
  );
}
