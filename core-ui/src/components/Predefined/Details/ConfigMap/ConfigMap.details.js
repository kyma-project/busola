import React from 'react';
import { useTranslation } from 'react-i18next';

import { ControlledBy } from 'react-shared';

import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

import './ConfigMapsDetails.scss';

export const ConfigMapsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const ConfigMapEditor = resource => {
    const { data } = resource;
    return Object.keys(data || {}).map(key => (
      <ReadonlyEditorPanel title={key} value={data[key]} key={key} />
    ));
  };

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: secret => (
        <ControlledBy ownerReferences={secret.metadata.ownerReferences} />
      ),
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[ConfigMapEditor]}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
