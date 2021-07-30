import React, { useEffect } from 'react';
import { FileInput } from 'react-shared';

export function KubeconfigFileUpload({
  onKubeconfigTextAdded,
  fileUploaderRef,
}) {
  useEffect(() => {
    fileUploaderRef.current.addEventListener('change', async event => {
      const file = event?.target?.files[0];
      onKubeconfigFileUploaded(file);
    });

    return () => {
      fileUploaderRef.current.removeEventListener('change', () => {});
    };
  }, []);

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
