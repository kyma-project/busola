import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useUrl } from 'hooks/useUrl';
import { useSentry } from 'hooks/useSentry';
import { useAppTracking } from 'hooks/tracking';

import { clusterState } from 'state/clusterAtom';
import { languageAtom } from 'state/preferences/languageAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { useAuthHandler } from 'state/authDataAtom';
import { useGetConfiguration } from 'state/configuration/configurationAtom';
import { useGetExtensions } from 'state/navigation/extensionsAtom';
import { useGetExtensibilitySchemas } from 'state/extensibilitySchemasAtom';
import { useGetValidationSchemas } from 'state/validationSchemasAtom';

import { useLoginWithKubeconfigID } from 'components/App/useLoginWithKubeconfigID';
import { useMakeGardenerLoginRoute } from 'components/Gardener/useMakeGardenerLoginRoute';
import { useHandleResetEndpoint } from 'components/Clusters/shared';
import { Preferences } from 'components/Preferences/Preferences';
import { useResourceSchemas } from './resourceSchemas/useResourceSchemas';
import { Header } from 'header/Header';
import { ContentWrapper } from './ContentWrapper/ContentWrapper';
import { Sidebar } from 'sidebar/Sidebar';
import { useInitTheme } from './useInitTheme';
import ClusterList from 'components/Clusters/views/ClusterList';
import ClusterRoutes from './ClusterRoutes';

import { IncorrectPath } from './IncorrectPath';

import './App.scss';
import { useAfterInitHook } from 'state/useAfterInitHook';
import useSidebarCondensed from 'sidebar/useSidebarCondensed';
import { useGetValidationEnabledSchemas } from 'state/validationEnabledSchemasAtom';
import { SplitterElement, SplitterLayout } from '@ui5/webcomponents-react';
import { showAIassistantState } from 'components/AIassistant/state/showAIassistantAtom';
import AIassistant from 'components/AIassistant/components/AIassistant';

export default function App() {
  const { t, i18n } = useTranslation();
  const language = useRecoilValue(languageAtom);
  const cluster = useRecoilValue(clusterState);
  const setNamespace = useSetRecoilState(activeNamespaceIdState);
  const { namespace } = useUrl();
  const makeGardenerLoginRoute = useMakeGardenerLoginRoute();

  useEffect(() => {
    setNamespace(namespace);
  }, [setNamespace, namespace]);

  useHandleResetEndpoint();
  const kubeconfigIdState = useLoginWithKubeconfigID();
  useResourceSchemas();
  useSidebarCondensed();

  useInitTheme();
  useAuthHandler();
  useGetConfiguration();
  useGetExtensions();
  useGetExtensibilitySchemas();
  useGetValidationSchemas();
  useGetValidationEnabledSchemas();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useSentry();
  useAppTracking();
  useAfterInitHook(kubeconfigIdState);

  const showAssistant = useRecoilValue(showAIassistantState);

  return (
    <SplitterLayout id="splitter-layout">
      <SplitterElement
        resizable={false}
        size={
          showAssistant.show
            ? showAssistant.fullScreen
              ? '0%'
              : '80%'
            : '100%'
        }
      >
        <div id="html-wrap">
          <Header />
          <div id="page-wrap">
            <Sidebar key={cluster?.name} />
            <ContentWrapper>
              <Routes key={cluster?.name}>
                <Route
                  path="*"
                  element={
                    <IncorrectPath
                      to="clusters"
                      message={t('components.incorrect-path.message.clusters')}
                    />
                  }
                />
                <Route path="/" />
                <Route path="clusters" element={<ClusterList />} />
                <Route
                  path="cluster/:currentClusterName"
                  element={<Navigate to="overview" />}
                />
                <Route
                  path="cluster/:currentClusterName/*"
                  element={<ClusterRoutes />}
                />
                {makeGardenerLoginRoute()}
              </Routes>
              <Preferences />
            </ContentWrapper>
          </div>
        </div>
      </SplitterElement>
      {showAssistant.show ? (
        <SplitterElement
          resizable={false}
          size={showAssistant.fullScreen ? '100%' : '20%'}
          minSize={325}
        >
          <AIassistant />
        </SplitterElement>
      ) : (
        <></>
      )}
    </SplitterLayout>
  );
}
