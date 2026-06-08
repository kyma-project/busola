import { useState } from 'react';
import { FileInput } from 'shared/components/FileInput/FileInput';
import { Title } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { HintButton } from 'shared/components/HintButton/HintButton';

type KubeconfigFileUploadProps = {
  onKubeconfigTextAdded: (kubeconfigText: string) => void;
};

export function KubeconfigFileUpload({
  onKubeconfigTextAdded,
}: KubeconfigFileUploadProps) {
  const { t } = useTranslation();
  const [showTitleDescription, setShowTitleDescription] = useState(false);

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e?.target?.result);
      reader.readAsText(file);
    });
  };

  const onKubeconfigFileUploaded = async (files: FileList) => {
    const fileContent = await readFile(files[0]);
    onKubeconfigTextAdded(fileContent as string);
  };

  return (
    <div>
      <Title level="H5" className="sap-margin-bottom-tiny">
        {t('clusters.wizard.kubeconfig-provide')}
        <>
          <HintButton
            setShowTitleDescription={setShowTitleDescription}
            showTitleDescription={showTitleDescription}
            description={t('clusters.wizard.intro')}
            className="sap-margin-begin-tiny"
            ariaTitle={t('clusters.wizard.kubeconfig-provide')}
          />
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
