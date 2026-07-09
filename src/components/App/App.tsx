import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import { useUrl } from 'hooks/useUrl';
import { useSentry } from 'hooks/useSentry';

import { clusterAtom } from 'state/clusterAtom';
import { languageAtom } from 'state/settings/languageAtom';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { useAuthHandler } from 'state/authDataAtom';
import { useGetConfiguration } from 'state/configuration/configurationAtom';
import { useGetExtensions } from 'state/navigation/extensionsAtom';
import { useGetExtensibilitySchemas } from 'state/extensibilitySchemasAtom';
import { useGetValidationSchemas } from 'state/validationSchemasAtom';
import { useLoginWithKubeconfigID } from 'components/App/useLoginWithKubeconfigID';
import { useMakeGardenerLoginRoute } from 'components/Gardener/useMakeGardenerLoginRoute';
import { useHandleResetEndpoint, Users } from 'components/Clusters/shared';
import { useResourceSchemas } from './resourceSchemas/useResourceSchemas';
import { removePreviousPath, useAfterInitHook } from 'state/useAfterInitHook';
import useSidebarCondensed from 'sidebar/useSidebarCondensed';
import { useGetValidationEnabledSchemas } from 'state/validationEnabledSchemasAtom';
import { multipleContextsAtom } from 'state/multipleContextsAtom';

import {
  Button,
  Dialog,
  Icon,
  SplitterElement,
  SplitterLayout,
} from '@ui5/webcomponents-react';
import horizontalGripIcon from '@ui5/webcomponents-icons/dist/horizontal-grip.js';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';
import { showTerminalAtom } from 'state/showTerminalAtom';
import KymaCompanion from 'components/KymaCompanion/components/KymaCompanion';
import { useAssistantAvailability } from 'components/KymaCompanion/hooks/useAssistantAvailability';
import { Settings } from 'components/Settings/Settings';
import { Header } from 'header/Header';
import { ContentWrapper } from './ContentWrapper/ContentWrapper';
import { Sidebar } from 'sidebar/Sidebar';
import ClusterList from 'components/Clusters/views/ClusterList';
import ClusterRoutes from './ClusterRoutes';
import { IncorrectPath } from './IncorrectPath';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ContextChooserMessage } from 'components/Clusters/components/ContextChooser/ContextChooser';
import { KubeconfigList } from 'components/KubeconfigList/KubeconfigList';
import { KubeconfigRedirect } from 'components/KubeconfigList/KubeconfigRedirect';

import { themeAtom } from 'state/settings/themeAtom';
import { initTheme } from './initTheme';

import './App.scss';
import '../../web-components/index'; //Import for custom Web Components
import { manualKubeConfigIdAtom } from 'state/manualKubeConfigIdAtom';
import { useSSOLogin } from 'state/ssoDataAtom';
import { AuthForm } from 'components/Clusters/components/AuthForm';
import { ResourceForm } from 'shared/ResourceForm';
import { checkAuthRequiredInputs } from 'components/Clusters/helper';
import { BusolaTerminal } from './BusolaTerminal/BusolaTerminal';
import { TERMINAL_MIN_HEIGHT } from './BusolaTerminal/terminalThemes';

export default function App() {
  const theme = useAtomValue(themeAtom);
  const language = useAtomValue(languageAtom);
  const cluster = useAtomValue(clusterAtom);
  const setNamespace = useSetAtom(activeNamespaceIdAtom);
  const { namespace } = useUrl();
  const makeGardenerLoginRoute = useMakeGardenerLoginRoute();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const authFormRef = useRef<HTMLFormElement>(null);
  const [search] = useSearchParams();
  const [contextsState, setContextsState] = useAtom(multipleContextsAtom);
  const [manualKubeConfigId, setManualKubeConfigId] = useAtom(
    manualKubeConfigIdAtom,
  );
  const [authFormState, setAuthFormState] = useState<{
    users?: Users;
  }>({});
  const [hasInvalidInputs, setHasInvalidInputs] = useState(false);

  useLayoutEffect(() => {
    setNamespace(namespace);
  }, [setNamespace, namespace]);

  useHandleResetEndpoint();
  const kubeconfigIdState = useLoginWithKubeconfigID();
  useResourceSchemas();
  useSidebarCondensed();

  useGetConfiguration();
  useSSOLogin();
  const { isLoading } = useAuthHandler();
  useGetExtensions();
  useGetExtensibilitySchemas();
  useGetValidationSchemas();
  useGetValidationEnabledSchemas();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useSentry();
  useAfterInitHook(kubeconfigIdState);

  const showCompanion = useAtomValue(showKymaCompanionAtom);
  const { showAssistant } = useAssistantAvailability();
  // Refuse to render on ineligible clusters even if some caller forgot to gate.
  const companionPanelOpen =
    showAssistant && showCompanion.show && !showCompanion.useJoule;
  const [showTerminalState, setShowTerminalState] = useAtom(showTerminalAtom);
  const {
    isOpen: isTerminalOpen,
    isDocked: isTerminalDocked,
    isFullscreen: isTerminalFullscreen,
    dockedHeight,
  } = showTerminalState;

  const [terminalMinHeight, setTerminalMinHeight] =
    useState(TERMINAL_MIN_HEIGHT);

  const effectiveTerminalHeight = useMemo(
    () => dockedHeight || Math.round(window.innerHeight * 0.35),
    [dockedHeight],
  );

  const handleSeparatorMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startY = e.clientY;
      const startHeight = effectiveTerminalHeight;

      const onMouseMove = (ev: MouseEvent) => {
        const delta = startY - ev.clientY;
        const newHeight = Math.max(
          terminalMinHeight,
          Math.min(startHeight + delta, window.innerHeight - 150),
        );
        setShowTerminalState((prev) => ({ ...prev, dockedHeight: newHeight }));
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };

      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [effectiveTerminalHeight, setShowTerminalState, terminalMinHeight],
  );

  const updateManualKubeConfigIdState = (e: any) => {
    e.preventDefault();
    const auth = authFormState?.users?.find(
      (user) => user?.user?.token || user?.user?.exec,
    )?.user;
    if (auth) {
      setManualKubeConfigId({
        formOpen: false,
        auth,
      });
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  const checkRequiredInputs = () => {
    // setTimeout is used to delay and ensure that the form validation runs after the state updates.
    setTimeout(() => {
      checkAuthRequiredInputs(authFormRef, setHasInvalidInputs);
    });
  };

  initTheme(theme);

  return (
    <SplitterLayout id="splitter-layout">
      <SplitterElement
        resizable={companionPanelOpen}
        size={
          companionPanelOpen
            ? showCompanion.fullScreen
              ? '0%'
              : '70%'
            : '100%'
        }
      >
        <div id="html-wrap">
          <Header />
          <div id="main-area">
            <div id="page-wrap">
              <Sidebar key={cluster?.name} />
              {search.get('kubeconfigID') &&
                manualKubeConfigId.formOpen &&
                createPortal(
                  <Dialog open={true}>
                    <ResourceForm.Single
                      formElementRef={authFormRef}
                      createResource={updateManualKubeConfigIdState}
                    >
                      <AuthForm
                        resource={authFormState}
                        setResource={setAuthFormState}
                        checkRequiredInputs={checkRequiredInputs}
                      />
                      <div className="auth-form-dialog-footer">
                        <Button disabled={hasInvalidInputs} type="Submit">
                          {t('clusters.add.title')}
                        </Button>
                      </div>
                    </ResourceForm.Single>
                  </Dialog>,
                  document.body,
                )}
              {search.get('kubeconfigID') &&
                !!contextsState?.contexts?.length &&
                kubeconfigIdState === 'loading' &&
                createPortal(
                  <ContextChooserMessage
                    contextState={contextsState}
                    setValue={(value: string) =>
                      setContextsState((state) => ({
                        ...state,
                        chosenContext: value,
                      }))
                    }
                    onCancel={() => {
                      setContextsState({} as any);
                      removePreviousPath();
                      navigate('/clusters');
                    }}
                  />,
                  document.body,
                )}
              <ContentWrapper>
                <Routes key={cluster?.name}>
                  {kubeconfigIdState !== 'loading' &&
                    !search.get('kubeconfigID') && (
                      <Route
                        path="*"
                        element={
                          <IncorrectPath
                            to="/clusters"
                            message={t(
                              'components.incorrect-path.message.clusters',
                            )}
                          />
                        }
                      />
                    )}
                  <Route path="clusters" element={<ClusterList />} />
                  <Route
                    path="kubeconfig"
                    element={
                      <Suspense fallback={<Spinner />}>
                        <KubeconfigList />
                      </Suspense>
                    }
                  />
                  <Route
                    path="kubeconfig/:name"
                    element={<KubeconfigRedirect />}
                  />
                  <Route
                    path="cluster/:currentClusterName"
                    element={<Navigate to="overview" />}
                  />
                  <Route path="cluster/:currentClusterName">
                    <Route path="*" element={<ClusterRoutes />} />
                  </Route>
                  {makeGardenerLoginRoute}
                </Routes>
                <Settings />
              </ContentWrapper>
            </div>
            {isTerminalOpen && isTerminalDocked && !isTerminalFullscreen && (
              <div
                className="terminal-separator"
                onMouseDown={handleSeparatorMouseDown}
              >
                <span className="terminal-separator__line-before" />
                <span className="terminal-separator__grip">
                  <Icon
                    name={horizontalGripIcon}
                    className="terminal-separator__grip-icon"
                  />
                </span>
                <span className="terminal-separator__line-after" />
              </div>
            )}
            {isTerminalOpen && (
              <BusolaTerminal
                dockedHeight={
                  isTerminalDocked && !isTerminalFullscreen
                    ? effectiveTerminalHeight
                    : undefined
                }
                onMinHeightComputed={setTerminalMinHeight}
              />
            )}
          </div>
        </div>
      </SplitterElement>
      {companionPanelOpen ? (
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
