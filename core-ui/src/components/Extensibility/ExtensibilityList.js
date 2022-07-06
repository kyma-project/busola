import React from 'react';
import { useTranslation } from 'react-i18next';
// import pluralize from 'pluralize';

// import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
// import { usePrepareListProps } from 'resources/helpers';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
// import { prettifyKind } from 'shared/utils/helpers';

import { useGetCRbyPath } from './useGetCRbyPath';
// import { ExtensibilityCreate } from './ExtensibilityCreate';
import { TranslationBundleContext } from './helpers';
// import { Widget } from './components/Widget';
import { RelationsContextProvider } from './contexts/RelationsContext';
import { ExtensibilityListCore } from './ExtensibilityListCore';

export const ExtensibilityList = () => {
  const { t } = useTranslation();
  const resMetaData = useGetCRbyPath();
  const { path } = resMetaData.resource ?? {};

  return (
    <TranslationBundleContext.Provider value={path}>
      <RelationsContextProvider relations={resMetaData?.relations || {}}>
        <ErrorBoundary
          customMessage={t('extensibility.error')}
          displayButton={false}
          key={path}
        >
          <ExtensibilityListCore resMetaData={resMetaData} />
        </ErrorBoundary>
      </RelationsContextProvider>
    </TranslationBundleContext.Provider>
  );
};
