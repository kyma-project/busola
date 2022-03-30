import React from 'react';
import { FileInput } from 'shared/components/FileInput/FileInput';
import { useTranslation } from 'react-i18next';

export function KubeconfigFileUpload({ onKubeconfigTextAdded }) {
  const { i18n } = useTranslation();

  const readFile = file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  const onKubeconfigFileUploaded = async file => {
    const fileContent = await readFile(file);
    onKubeconfigTextAdded(fileContent);
  };

  return (
    <FileInput
      fileInputChanged={onKubeconfigFileUploaded}
      acceptedFileFormats=".yaml,.yml"
      i18n={i18n}
    />
  );
}
