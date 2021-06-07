import React from 'react';
import { FileInput } from 'react-shared';

export function KubeconfigFileUpload({ onKubeconfigTextAdded }) {
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
      acceptedFileFormats=".yaml"
    />
  );
}
