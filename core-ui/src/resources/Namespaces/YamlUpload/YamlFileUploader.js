import React from 'react';
import { FileInput } from 'shared/components/FileInput/FileInput';
import { useTranslation } from 'react-i18next';

export function YamlFileUploader({ onYamlContentAdded }) {
  const { i18n } = useTranslation();

  const readFile = file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  const onYamlContentUploaded = files => {
    void Promise.all([...files]?.map(readFile))
      .then(contents => {
        onYamlContentAdded(contents.join('\n---\n'));
      })
      .catch(e => console.error(e));
  };

  return (
    <FileInput
      fileInputChanged={onYamlContentUploaded}
      acceptedFileFormats=".yaml,.yml"
      i18n={i18n}
      allowMultiple
    />
  );
}
