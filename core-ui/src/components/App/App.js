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

import { resourceRoutes } from 'resources';
import { createExtensibilityRoutes } from './ExtensibilityRoutes';
import otherRoutes from 'resources/other';
import { Sidebar } from 'sidebar/Sidebar';
import { useLuigiContextMigrator } from './useLuigiContextMigrator';
import { useConfigContextMigrator } from 'components/App/useConfigContextMigrator';

import './App.scss';

export default function App() {
  const { cluster, language, customResources = [] } = useMicrofrontendContext();
  const { t, i18n } = useTranslation();

  useLoginWithKubeconfigID();
  useResourceSchemas();

  useLuigiContextMigrator();
  useConfigContextMigrator();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useSentry();
  useAppTracking();

  return (
    <div id="page-wrap">
      <Sidebar />
      <div id="content-wrap">
        <Routes key={cluster?.name}>
          {/* force rerender on cluster change*/}
          <Route
            path="/overview" // overview route should stay static
            element={
              <WithTitle title={t('clusters.overview.title-current-cluster')}>
                <ClusterOverview />
              </WithTitle>
            }
          />
          {/* extensibility routes should go first, so if someone overwrites the default view, the new one should have a higher priority */}
          {customResources?.map(cr => createExtensibilityRoutes(cr, language))}
          {resourceRoutes}
          {otherRoutes}
          <Route path="" element={<MainFrameRedirection />} />
        </Routes>
      </div>
    </div>
  );
}
