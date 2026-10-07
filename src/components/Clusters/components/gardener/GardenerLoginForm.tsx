import { MessageStrip, TextArea } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { FileInput } from 'shared/components/FileInput/FileInput';
import { Kubeconfig } from 'types';
import { extractShootRef } from './gardenlogin';

type Props = {
  shootKubeconfig: Kubeconfig;
  gardenText: string;
  setGardenText: (value: string) => void;
  tokenInput: string;
  setTokenInput: (value: string) => void;
};

const readFile = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e?.target?.result as string) ?? '');
    reader.readAsText(file);
  });

// Step content for a detected gardenlogin shoot kubeconfig. Rendered inside the
// Add Cluster wizard as a normal step (not a separate dialog); the wizard's
// "Connect cluster" finish performs the AdminKubeconfigRequest mint.
export function GardenerLoginForm({
  shootKubeconfig,
  gardenText,
  setGardenText,
  tokenInput,
  setTokenInput,
}: Props) {
  const { t } = useTranslation();
  const shootRef = extractShootRef(shootKubeconfig);

  return (
    <div className="add-cluster__content-container">
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
      <FileInput
        fileInputChanged={async (files: FileList) => {
          if (files?.[0]) setGardenText(await readFile(files[0]));
        }}
        acceptedFileFormats=".yaml,.yml"
        customMessage={t('clusters.wizard.kubeconfig-upload')}
      />
      <TextArea
        className="sap-margin-top-tiny"
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
    </div>
  );
}
