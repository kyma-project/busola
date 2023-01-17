import React from 'react';

import { FormRadioGroup, FormRadioItem } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import './ChooseStorage.scss';

export function ChooseStorage({ storage, setStorage }) {
  const { t } = useTranslation();

  return (
    <>
      <p className="storage-info">{t('clusters.storage.info')}</p>

      <FormRadioGroup
        className="choose-storage"
        onChange={(_, type) => setStorage(type)}
      >
        <FormRadioItem
          data="localStorage"
          checked={storage === 'localStorage'}
          // prevent error for checked without onChange
          inputProps={{ onChange: () => {} }}
        >
          {t('clusters.storage.labels.localStorage')}:{' '}
          {t('clusters.storage.descriptions.localStorage')}
        </FormRadioItem>

        <FormRadioItem
          data="sessionStorage"
          checked={storage === 'sessionStorage'}
          inputProps={{ onChange: () => {} }}
        >
          {t('clusters.storage.labels.sessionStorage')}:{' '}
          {t('clusters.storage.descriptions.sessionStorage')}
        </FormRadioItem>

        <FormRadioItem
          data="inMemory"
          checked={storage === 'inMemory'}
          inputProps={{ onChange: () => {} }}
        >
          {t('clusters.storage.labels.inMemory')}:{' '}
          {t('clusters.storage.descriptions.inMemory')}
        </FormRadioItem>
      </FormRadioGroup>
    </>
  );
}
