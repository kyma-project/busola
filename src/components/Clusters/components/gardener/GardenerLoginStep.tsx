import { useState } from 'react';
import {
  Button,
  MessageStrip,
  TextArea,
  Title,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import jsyaml from 'js-yaml';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { getClusterConfig } from 'state/utils/getBackendInfo';
import { addByContext } from 'components/Clusters/shared';
import { Kubeconfig, KubeconfigContext, ValidKubeconfig } from 'types';
import { extractShootRef } from './gardenlogin';
import { requestAdminKubeconfig } from './requestAdminKubeconfig';
import {
  getGardenServer,
  getGardenStaticToken,
  isGardenOidc,
} from './getGardenToken';

type Props = {
  shootKubeconfig: Kubeconfig;
  config: any;
  onCancel: () => void;
  onConnected: () => void;
};

export function GardenerLoginStep({
  shootKubeconfig,
  config,
  onCancel,
  onConnected,
}: Props) {
  const { t } = useTranslation();
  const clustersInfo = useClustersInfo();
  const shootRef = extractShootRef(shootKubeconfig);

  const [gardenText, setGardenText] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const connect = async () => {
    setError(null);
    if (!shootRef) return setError(t('clusters.gardener.errors.no-shoot-ref'));

    let garden: ValidKubeconfig;
    try {
      garden = jsyaml.load(gardenText) as ValidKubeconfig;
    } catch {
      return setError(t('clusters.gardener.errors.garden-parse'));
    }

    const gardenServer = getGardenServer(garden);
    if (!gardenServer)
      return setError(t('clusters.gardener.errors.no-garden-server'));

    const token = getGardenStaticToken(garden) || tokenInput.trim();
    if (!token) {
      return setError(
        isGardenOidc(garden)
          ? t('clusters.gardener.errors.oidc-not-supported')
          : t('clusters.gardener.errors.no-token'),
      );
    }

    setBusy(true);
    try {
      const { backendAddress } = getClusterConfig();
      const minted = await requestAdminKubeconfig({
        backendAddress,
        gardenServer,
        token,
        namespace: shootRef.namespace,
        shootName: shootRef.name,
      });
      const contextName = minted['current-context'];
      const context = minted.contexts.find(
        (c) => c.name === contextName,
      ) as KubeconfigContext;
      addByContext(
        {
          kubeconfig: minted as Kubeconfig,
          context,
          storage: 'sessionStorage',
          config,
        },
        clustersInfo,
      );
      onConnected();
    } catch (e) {
      setError(t('clusters.gardener.error', { message: (e as Error).message }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="add-cluster__content-container">
      <Title level="H5" className="sap-margin-bottom-small">
        {t('clusters.gardener.wizard-title')}
      </Title>
      <MessageStrip
        design="Information"
        hideCloseButton
        className="sap-margin-bottom-small"
      >
        {shootRef
          ? t('clusters.gardener.detected', {
              name: shootRef.name,
              namespace: shootRef.namespace,
              identity: shootRef.gardenClusterIdentity ?? '-',
            })
          : t('clusters.gardener.errors.no-shoot-ref')}
      </MessageStrip>

      <label>{t('clusters.gardener.garden-kubeconfig-label')}</label>
      <TextArea
        rows={8}
        value={gardenText}
        onInput={(e) => setGardenText(e.target.value ?? '')}
      />

      <label className="sap-margin-top-small">
        {t('clusters.gardener.token-label')}
      </label>
      <TextArea
        rows={3}
        value={tokenInput}
        placeholder={t('clusters.gardener.token-hint')}
        onInput={(e) => setTokenInput(e.target.value ?? '')}
      />

      {error && (
        <MessageStrip
          design="Negative"
          hideCloseButton
          className="sap-margin-top-small"
        >
          {error}
        </MessageStrip>
      )}

      <div className="sap-margin-top-small">
        <Button design="Transparent" onClick={onCancel} disabled={busy}>
          {t('common.buttons.cancel')}
        </Button>
        <Button
          design="Emphasized"
          onClick={connect}
          disabled={busy || !shootRef}
        >
          {t('clusters.gardener.connect')}
        </Button>
      </div>
    </div>
  );
}
