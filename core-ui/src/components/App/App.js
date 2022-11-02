import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
import { useAppTracking } from 'hooks/tracking';
import { useSentry } from 'hooks/useSentry';
import { MainFrameRedirection } from 'shared/components/MainFrameRedirection/MainFrameRedirection';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { WithTitle } from 'shared/hooks/useWindowTitle';

import { useLoginWithKubeconfigID } from 'components/App/useLoginWithKubeconfigID';
import { useResourceSchemas } from './resourceSchemas/useResourceSchemas';
import { languageAtom } from 'state/preferences/languageAtom';
import { themeState } from 'state/preferences/themeAtom';

import { useConfigContextMigrator } from 'components/App/useConfigContextMigrator';
import { Header } from 'header/Header';
import { Preferences } from 'components/Preferences/Preferences';
import { resourceRoutes } from 'resources';
import otherRoutes from 'resources/other';
import { Sidebar } from 'sidebar/Sidebar';
import { createExtensibilityRoutes } from './ExtensibilityRoutes';
import { useLuigiContextMigrator } from './useLuigiContextMigrator';

import './App.css';

export default function App() {
  const { cluster, customResources = [] } = useMicrofrontendContext();
  const { t, i18n } = useTranslation();
  const language = useRecoilValue(languageAtom);

  useLoginWithKubeconfigID();
  useResourceSchemas();

  useLuigiContextMigrator();
  useConfigContextMigrator();

  void useRecoilValue(themeState);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useSentry();
  useAppTracking();

  return (
    <>
      <Header></Header>
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
            {customResources?.map(cr =>
              createExtensibilityRoutes(cr, language),
            )}
            {resourceRoutes}
            {otherRoutes}
            <Route path="" element={<MainFrameRedirection />} />
          </Routes>
          <Preferences />
        </div>
      </div>
    </>
  );
}
