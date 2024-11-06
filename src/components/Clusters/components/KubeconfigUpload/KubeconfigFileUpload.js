import { useState } from 'react';
import { FileInput } from 'shared/components/FileInput/FileInput';
import { Title, Button, Popover, Text } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

export function KubeconfigFileUpload({ onKubeconfigTextAdded }) {
  const { t } = useTranslation();
  const [showTitleDescription, setShowTitleDescription] = useState(false);

  const readFile = file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  const onKubeconfigFileUploaded = async files => {
    const fileContent = await readFile(files[0]);
    onKubeconfigTextAdded(fileContent);
  };

  return (
    <div>
      <Title level="H5" className="sap-margin-bottom-tiny">
        {t('clusters.wizard.kubeconfig')}
        <>
          <Button
            id="descriptionOpener"
            icon="hint"
            design="Transparent"
            className="sap-margin-begin-tiny"
            onClick={() => {
              setShowTitleDescription(true);
            }}
          />
          {createPortal(
            <Popover
              opener="descriptionOpener"
              open={showTitleDescription}
              onClose={() => setShowTitleDescription(false)}
              placement="End"
            >
              <Text className="description">{t('clusters.wizard.intro')}</Text>
            </Popover>,
            document.body,
          )}
        </>
      </Title>
      <FileInput
        fileInputChanged={onKubeconfigFileUploaded}
        acceptedFileFormats=".yaml,.yml"
        customMessage={t('clusters.wizard.kubeconfig-upload')}
      />
    </div>
  );
}
