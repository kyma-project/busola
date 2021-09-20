import React from 'react';

import { MessageStrip, FormRadioGroup, FormRadioItem } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import './ChooseStorage.scss';

export function ChooseStorage({ storage, setStorage }) {
  const { t } = useTranslation();

  return (
    <FormRadioGroup
      className="choose-storage"
      onChange={(_, type) => setStorage(type)}
    >
      <FormRadioItem data="localStorage" checked={storage === 'localStorage'}>
        {t('clusters.storage.labels.localStorage')}
      </FormRadioItem>
      <p>{t('clusters.storage.descriptions.localStorage')}</p>

      <FormRadioItem
        data="sessionStorage"
        checked={storage === 'sessionStorage'}
      >
        {t('clusters.storage.labels.sessionStorage')}
      </FormRadioItem>
      <p>{t('clusters.storage.descriptions.sessionStorage')}</p>

      <FormRadioItem data="inMemory" checked={storage === 'inMemory'}>
        {t('clusters.storage.labels.inMemory')}
      </FormRadioItem>
      <p>{t('clusters.storage.descriptions.inMemory')}</p>
    </FormRadioGroup>
  );
}
