import { useEffect } from 'react';
import { Navigate, Route, Routes, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

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
import { useResourceSchemas } from './resourceSchemas/useResourceSchemas';
import { useAfterInitHook } from 'state/useAfterInitHook';
import useSidebarCondensed from 'sidebar/useSidebarCondensed';
import { useGetValidationEnabledSchemas } from 'state/validationEnabledSchemasAtom';
import { useGetKymaResources } from 'state/kymaResourcesAtom';
import { multipleContexts } from 'state/multipleContextsAtom';

import { SplitterElement, SplitterLayout } from '@ui5/webcomponents-react';
import { showKymaCompanionState } from 'state/companion/showKymaCompanionAtom';
import KymaCompanion from 'components/KymaCompanion/components/KymaCompanion';
import { Preferences } from 'components/Preferences/Preferences';
import { Header } from 'header/Header';
import { ContentWrapper } from './ContentWrapper/ContentWrapper';
import { Sidebar } from 'sidebar/Sidebar';
import ClusterList from 'components/Clusters/views/ClusterList';
import ClusterRoutes from './ClusterRoutes';
import { IncorrectPath } from './IncorrectPath';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ContextChooserMessage } from 'components/Clusters/components/ContextChooser/ContextChooser';

import { themeState } from 'state/preferences/themeAtom';
import { initTheme } from './initTheme';

import './App.scss';
import '../../web-components/index'; //Import for custom Web Components

export default function App() {
  const theme = useRecoilValue(themeState);
  const language = useRecoilValue(languageAtom);
  const cluster = useRecoilValue(clusterState);
  const setNamespace = useSetRecoilState(activeNamespaceIdState);
  const { namespace } = useUrl();
  const makeGardenerLoginRoute = useMakeGardenerLoginRoute();
  const { t, i18n } = useTranslation();
  const [search] = useSearchParams();
  const [contextsState, setContextsState] = useRecoilState(multipleContexts);

  useEffect(() => {
    setNamespace(namespace);
  }, [setNamespace, namespace]);

  useHandleResetEndpoint();
  const kubeconfigIdState = useLoginWithKubeconfigID();
  useResourceSchemas();
  useSidebarCondensed();

  const { isLoading } = useAuthHandler();
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
  useGetKymaResources();

  const showCompanion = useRecoilValue(showKymaCompanionState);

  if (isLoading) {
    return <Spinner />;
  }

  initTheme(theme);

  return (
    <SplitterLayout id="splitter-layout">
      <SplitterElement
        resizable={showCompanion.show}
        size={
          showCompanion.show
            ? showCompanion.fullScreen
              ? '0%'
              : '70%'
            : '100%'
        }
      >
        <div id="html-wrap">
          <Header />
          <div id="page-wrap">
            <Sidebar key={cluster?.name} />
            {search.get('kubeconfigID') &&
              !!contextsState?.contexts?.length &&
              kubeconfigIdState === 'loading' && (
                <ContextChooserMessage
                  contexts={contextsState?.contexts}
                  setValue={(value: string) =>
                    setContextsState(state => ({
                      ...state,
                      chosenContext: value,
                    }))
                  }
                  onCancel={() => {
                    // TODO: handle cancel
                  }}
                />
              )}
            <ContentWrapper>
              <Routes key={cluster?.name}>
                {kubeconfigIdState !== 'loading' && (
                  <Route
                    path="*"
                    element={
                      <IncorrectPath
                        to="clusters"
                        message={t(
                          'components.incorrect-path.message.clusters',
                        )}
                      />
                    }
                  />
                )}
                <Route path="clusters" element={<ClusterList />} />
                <Route
                  path="cluster/:currentClusterName"
                  element={<Navigate to="overview" />}
                />
                <Route path="cluster/:currentClusterName">
                  <Route path="*" element={<ClusterRoutes />} />
                </Route>
                {makeGardenerLoginRoute()}
              </Routes>
              <Preferences />
            </ContentWrapper>
          </div>
        </div>
      </SplitterElement>
      {showCompanion.show ? (
        <SplitterElement
          resizable={!showCompanion.fullScreen}
          size={showCompanion.fullScreen ? '100%' : '30%'}
          minSize={400}
        >
          <KymaCompanion />
        </SplitterElement>
      ) : (
        <></>
      )}
    </SplitterLayout>
  );
}
