import React from 'react';
import { useWebcomponents } from 'react-shared';

export function KubeconfigFileUpload({
  onKubeconfigTextAdded,
  fileUploaderRef,
}) {
  const onKubeconfigFileUploaded = async event => {
    const file = event?.target?.files[0];
    const fileContent = await readFile(file);
    onKubeconfigTextAdded(fileContent);
  };

  useWebcomponents(fileUploaderRef, 'change', onKubeconfigFileUploaded);

  const readFile = file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  return (
    <>
      <ui5-file-uploader
        ref={fileUploaderRef}
        accept=".yaml,.yml"
        multiple="false"
      >
        <ui5-button icon="upload">Upload kubeconfig</ui5-button>
      </ui5-file-uploader>
    </>
  );
}
