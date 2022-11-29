import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { MainFrameRedirection } from 'shared/components/MainFrameRedirection/MainFrameRedirection';
import { useSentry } from 'hooks/useSentry';
import { useAppTracking } from 'hooks/tracking';
import { clusterState } from 'state/clusterAtom';

import { useLoginWithKubeconfigID } from 'components/App/useLoginWithKubeconfigID';
import { useResourceSchemas } from './resourceSchemas/useResourceSchemas';
import { languageAtom } from 'state/preferences/languageAtom';

import { Header } from 'header/Header';
import { ContentWrapper } from './ContentWrapper/ContentWrapper';
import { Preferences } from 'components/Preferences/Preferences';
import { Sidebar } from 'sidebar/Sidebar';
import { useLuigiContextMigrator } from './useLuigiContextMigrator';
import { useConfigContextMigrator } from 'components/App/useConfigContextMigrator';
import { useInitTheme } from './useInitTheme';

import ClusterList from 'components/Clusters/views/ClusterList';
import ClusterRoutes from './ClusterRoutes';

import './App.scss';

export default function App() {
  const { i18n } = useTranslation();
  const language = useRecoilValue(languageAtom);
  const cluster = useRecoilValue(clusterState);

  useLoginWithKubeconfigID();
  useResourceSchemas();

  useLuigiContextMigrator();
  useConfigContextMigrator();

  useInitTheme();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useSentry();
  useAppTracking();

  return (
    <>
      <Header />
      <div id="page-wrap">
        <Sidebar key={cluster?.name} />
        <ContentWrapper>
          <Routes key={cluster?.name}>
            <Route path="clusters" element={<ClusterList />} />
            <Route
              path="cluster/:currentClusterName"
              element={<Navigate to="overview" />}
            />
            <Route
              path="cluster/:currentClusterName/*"
              element={<ClusterRoutes />}
            ></Route>
            <Route path="" element={<MainFrameRedirection />} />
          </Routes>
          <Preferences />
        </ContentWrapper>
      </div>
    </>
  );
}
