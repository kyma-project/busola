import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { MainFrameRedirection } from 'shared/components/MainFrameRedirection/MainFrameRedirection';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { WithTitle } from 'shared/hooks/useWindowTitle';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
import { useSentry } from 'hooks/useSentry';
import { useAppTracking } from 'hooks/tracking';

import { useLoginWithKubeconfigID } from 'components/App/useLoginWithKubeconfigID';
import { useResourceSchemas } from './resourceSchemas/useResourceSchemas';
import { AppContext } from './AppContext';

import { resourceRoutes } from 'resources';
import { createExtensibilityRoutes } from './ExtensibilityRoutes';
import otherRoutes from 'resources/other';

export default function App() {
  const { cluster, language, customResources = [] } = useMicrofrontendContext();
  const { t, i18n } = useTranslation();

  useLoginWithKubeconfigID();
  const schemaInfo = useResourceSchemas();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useSentry();
  useAppTracking();

  return (
    <AppContext.Provider value={{ schemaInfo }}>
      {/* force rerender on cluster change*/}
      <Routes key={cluster?.name}>
        <Route
          path="/overview" // overview route should stay static
          element={
            <WithTitle title={t('clusters.overview.title-current-cluster')}>
              <ClusterOverview />
            </WithTitle>
          }
        />

        {/* extensibility routes should go first, so if someone overwites the default view, the new one should have a higher priority */}
        {customResources?.map(cr => createExtensibilityRoutes(cr, language))}
        {resourceRoutes}
        {otherRoutes}
        <Route path="" element={<MainFrameRedirection />} />
      </Routes>
    </AppContext.Provider>
  );
}
