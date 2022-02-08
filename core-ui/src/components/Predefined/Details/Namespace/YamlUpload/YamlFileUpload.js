import React from 'react';
import { FileInput } from 'react-shared';
import { useTranslation } from 'react-i18next';

export function YamlFileUpload({ onYamlContentAdded }) {
  const { i18n } = useTranslation();

  const readFile = file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  const onYamlContentUploaded = async file => {
    const fileContent = await readFile(file);
    onYamlContentAdded(fileContent);
  };

  return (
    <FileInput
      fileInputChanged={onYamlContentUploaded}
      acceptedFileFormats=".yaml"
      i18n={i18n}
    />
  );
}
