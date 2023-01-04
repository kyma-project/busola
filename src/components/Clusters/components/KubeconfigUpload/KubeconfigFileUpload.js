import React from 'react';
import { FileInput } from 'shared/components/FileInput/FileInput';

export function KubeconfigFileUpload({ onKubeconfigTextAdded }) {
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
    <FileInput
      fileInputChanged={onKubeconfigFileUploaded}
      acceptedFileFormats=".yaml,.yml"
    />
  );
}
