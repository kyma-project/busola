import { useState } from 'react';
import {
  Ui5CustomEvent,
  WizardDomRef,
  Title,
  Wizard,
  WizardStep,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import jsyaml from 'js-yaml';

import { ResourceForm } from 'shared/ResourceForm';
import { useCustomFormValidator } from 'shared/hooks/useCustomFormValidator/useCustomFormValidator';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { authDataAtom } from 'state/authDataAtom';
import { showAddClusterWizardAtom } from 'state/showAddClusterWizardAtom';
import { isFormOpenAtom } from 'state/formOpenAtom';
import { getClusterConfig } from 'state/utils/getBackendInfo';
import { checkAuthRequiredInputs } from '../helper';

import { addByContext, getUser, hasKubeconfigAuth } from '../shared';
import { AuthForm } from './AuthForm';
import { KubeconfigUpload } from './KubeconfigUpload/KubeconfigUpload';
import { ContextChooser } from './ContextChooser/ContextChooser';
import { ChooseStorage } from './ChooseStorage';
import { WizardButtons } from 'shared/components/WizardButtons/WizardButtons';
import { ClusterPreview } from './ClusterPreview';
import { HintButton } from 'shared/components/HintButton/HintButton';
import { ClusterConfig } from 'state/clusterAtom';
import {
  Kubeconfig,
  KubeconfigContext,
  KubeconfigNonOIDCAuthToken,
  ValidKubeconfig,
} from 'types';
import { useNonInteractiveOidcContexts } from './oidc-interactive-check';

import './AddClusterWizard.scss';
import { WizardStepChangeEventDetail } from '@ui5/webcomponents-fiori/dist/Wizard.js';
import {
  isGardenloginKubeconfig,
  extractShootRef,
} from './gardener/gardenlogin';
import { GardenerLoginForm } from './gardener/GardenerLoginForm';
import { requestAdminKubeconfig } from './gardener/requestAdminKubeconfig';
import {
  getGardenServer,
  getGardenStaticToken,
} from './gardener/getGardenToken';

export function AddClusterWizard({
  config = {} as ClusterConfig,
}: {
  config?: ClusterConfig;
}) {
  const busolaClusterParams = useAtomValue(configurationAtom);
  const { t } = useTranslation();
  const notification = useNotification();
  const clustersInfo = useClustersInfo();
  const setAuth = useSetAtom(authDataAtom);

  const [hasAuth, setHasAuth] = useState(false);
  const [hasOneContext, setHasOneContext] = useState(false);
  const [storage, setStorage] = useState(
    busolaClusterParams?.storageType || 'sessionStorage',
  );
  const [selected, setSelected] = useState(1);
  const setShowWizard = useSetAtom(showAddClusterWizardAtom);
  const [showTitleDescription, setShowTitleDescription] = useState(false);
  const setIsFormOpen = useSetAtom(isFormOpenAtom);
  const [chosenContext, setChosenContext] = useState<string | undefined>(
    undefined,
  );
  const [hasInvalidInputs, setHasInvalidInputs] = useState(false);
  const [kubeconfig, setKubeconfig] = useState<Kubeconfig | undefined>(
    undefined,
  );
  // Gardenlogin step inputs: the garden cluster kubeconfig + a bearer token.
  const [gardenText, setGardenText] = useState('');
  const [gardenToken, setGardenToken] = useState('');
  const [gardenExpirationHours, setGardenExpirationHours] = useState(8);

  const {
    isValid: authValid,
    formElementRef: authFormRef,
    setCustomValid,
    revalidate,
  } = useCustomFormValidator();

  const nonInteractiveContexts = useNonInteractiveOidcContexts(
    kubeconfig?.contexts,
    kubeconfig?.users,
  );

  const isGardenlogin = !!kubeconfig && isGardenloginKubeconfig(kubeconfig);

  const updateKubeconfig = (kubeconfig?: Kubeconfig) => {
    if (!kubeconfig) {
      setKubeconfig(undefined);
      return;
    }

    if (Array.isArray(kubeconfig?.contexts)) {
      if ((getUser(kubeconfig) as KubeconfigNonOIDCAuthToken)?.token) {
        setStorage('sessionStorage');
      } else {
        setStorage('localStorage');
      }
    }

    const hasOneContext = kubeconfig?.contexts?.length === 1;
    setHasOneContext(hasOneContext);

    const hasAuth = hasKubeconfigAuth(kubeconfig);
    setHasAuth(hasAuth);

    setKubeconfig(kubeconfig);
  };

  // Mint the shoot's admin kubeconfig via the garden and connect it. Throws on
  // any validation/mint failure so onComplete can surface it and keep the
  // wizard open for a retry.
  const addGardenerShoot = async () => {
    const shootRef = extractShootRef(kubeconfig);
    if (!shootRef) throw new Error(t('clusters.gardener.errors.no-shoot-ref'));

    let garden: ValidKubeconfig;
    try {
      garden = jsyaml.load(gardenText) as ValidKubeconfig;
    } catch {
      throw new Error(t('clusters.gardener.errors.garden-parse'));
    }

    const gardenServer = getGardenServer(garden);
    if (!gardenServer)
      throw new Error(t('clusters.gardener.errors.no-garden-server'));

    const token = getGardenStaticToken(garden) || gardenToken.trim();
    if (!token) throw new Error(t('clusters.gardener.errors.no-token'));

    const { backendAddress } = getClusterConfig();
    const minted = await requestAdminKubeconfig({
      backendAddress,
      gardenServer,
      token,
      namespace: shootRef.namespace,
      shootName: shootRef.name,
      expirationSeconds: gardenExpirationHours * 60 * 60,
    });

    const mintedContextName = minted['current-context'];
    const context = minted.contexts.find(
      (c) => c.name === mintedContextName,
    ) as KubeconfigContext;
    addByContext(
      { kubeconfig: minted as Kubeconfig, context, storage, config },
      clustersInfo,
    );
  };

  const onComplete = async () => {
    setAuth(null);
    if (!kubeconfig) return;

    if (isGardenlogin) {
      try {
        await addGardenerShoot();
        setIsFormOpen({ formOpen: false });
        setShowWizard(false);
        updateKubeconfig();
      } catch (e) {
        notification.notifyError({
          content: `${t('clusters.messages.wrong-configuration')}. ${
            e instanceof Error && e?.message ? e.message : ''
          }`,
        });
        console.warn(e);
        // keep the wizard open so the user can fix the garden kubeconfig/token
      }
      return;
    }

    try {
      const contextName = kubeconfig?.['current-context'];
      if (!kubeconfig?.contexts?.length) {
        addByContext(
          {
            kubeconfig,
            context: {
              name: kubeconfig?.clusters?.[0]?.name ?? '',
              context: {
                cluster: kubeconfig?.clusters?.[0]?.name ?? '',
                user: kubeconfig?.users?.[0]?.name ?? '',
              },
            },
            storage,
            config,
          },
          clustersInfo,
        );
      } else if (contextName === '-all-') {
        let firstAdded = true;
        kubeconfig.contexts.forEach((context) => {
          if (nonInteractiveContexts.has(context?.name ?? '')) return;
          addByContext(
            {
              kubeconfig,
              context: context as KubeconfigContext,
              switchCluster: firstAdded,
              storage,
              config,
            },
            clustersInfo,
          );
          firstAdded = false;
        });
      } else {
        const context = kubeconfig.contexts.find(
          (context) => context?.name === contextName,
        ) as KubeconfigContext;
        addByContext({ kubeconfig, context, storage, config }, clustersInfo);
      }
      setIsFormOpen({ formOpen: false });
    } catch (e) {
      notification.notifyError({
        content: `${t('clusters.messages.wrong-configuration')}. ${
          e instanceof Error && e?.message ? e.message : ''
        }`,
      });
      console.warn(e);
    }
    setShowWizard(false);
    updateKubeconfig();
  };

  const onCancel = () => {
    setShowWizard(false);
    updateKubeconfig();
  };

  const handleStepChange = (
    e: Ui5CustomEvent<WizardDomRef, WizardStepChangeEventDetail>,
  ) => {
    setSelected(Number(e.detail.step.dataset.step));
  };

  const isCurrentStepInvalid = (step: number) => {
    const invalidMultipleContexts = !hasOneContext && !chosenContext;
    switch (step) {
      case 1:
        return !kubeconfig;
      case 2:
        if (isGardenlogin) return !(gardenText.trim() && gardenToken.trim());
        return kubeconfig && (!hasAuth || !hasOneContext)
          ? !authValid || invalidMultipleContexts || hasInvalidInputs
          : false;
      default:
        return false;
    }
  };

  const checkRequiredInputs = () => {
    // setTimeout is used to delay and ensure that the form validation runs after the state updates.
    setTimeout(() => {
      checkAuthRequiredInputs(authFormRef, setHasInvalidInputs);
    });
  };

  return (
    <>
      <Wizard contentLayout="SingleStep" onStepChange={handleStepChange}>
        <WizardStep
          titleText={t('common.headers.configuration')}
          branching={!kubeconfig}
          selected={selected === 1}
          data-step={'1'}
        >
          <KubeconfigUpload
            kubeconfig={kubeconfig}
            setKubeconfig={updateKubeconfig}
            formRef={authFormRef}
          />
        </WizardStep>
        {kubeconfig && (!hasAuth || !hasOneContext) && (
          <WizardStep
            titleText={
              isGardenlogin
                ? t('clusters.gardener.wizard-title')
                : t('clusters.wizard.authentication')
            }
            selected={selected === 2}
            disabled={selected !== 2}
            data-step={'2'}
          >
            {isGardenlogin ? (
              <GardenerLoginForm
                shootKubeconfig={kubeconfig}
                gardenText={gardenText}
                setGardenText={setGardenText}
                tokenInput={gardenToken}
                setTokenInput={setGardenToken}
                expirationHours={gardenExpirationHours}
                setExpirationHours={setGardenExpirationHours}
              />
            ) : (
              <div className="cluster-wizard__auth-container">
                <ResourceForm.Single
                  formElementRef={authFormRef}
                  resource={kubeconfig}
                  setResource={updateKubeconfig}
                  setCustomValid={setCustomValid}
                  createResource={(e) => {
                    e.preventDefault();
                  }}
                  className="cluster-wizard__auth-form"
                >
                  {!hasOneContext && (
                    <ContextChooser
                      chosenContext={chosenContext ?? ''}
                      setChosenContext={setChosenContext}
                    />
                  )}
                  {!hasAuth && (
                    <AuthForm
                      checkRequiredInputs={checkRequiredInputs}
                      revalidate={revalidate}
                    />
                  )}
                </ResourceForm.Single>
              </div>
            )}
          </WizardStep>
        )}
        <WizardStep
          titleText={t('clusters.wizard.storage')}
          selected={
            kubeconfig && (!hasAuth || !hasOneContext)
              ? selected === 3
              : selected === 2
          }
          disabled={
            kubeconfig && (!hasAuth || !hasOneContext)
              ? selected !== 3
              : selected !== 2
          }
          data-step={!hasAuth || !hasOneContext ? '3' : '2'}
        >
          <div className="add-cluster__content-container">
            <Title level="H5" className="sap-margin-bottom-small">
              {t('clusters.storage.choose-storage.label')}
              <HintButton
                id="storageDescriptionOpener"
                className="sap-margin-begin-tiny"
                setShowTitleDescription={setShowTitleDescription}
                description={t('clusters.storage.info')}
                showTitleDescription={showTitleDescription}
                ariaTitle={t('clusters.storage.choose-storage.label')}
              />
            </Title>
            <ChooseStorage
              storage={storage}
              setStorage={setStorage}
              hideLabel
            />
          </div>
        </WizardStep>
        <WizardStep
          titleText={t('clusters.wizard.review')}
          selected={
            kubeconfig && (!hasAuth || !hasOneContext)
              ? selected === 4
              : selected === 3
          }
          disabled={
            kubeconfig && (!hasAuth || !hasOneContext)
              ? selected !== 4
              : selected !== 3
          }
          data-step={!hasAuth || !hasOneContext ? '4' : '3'}
        >
          <ClusterPreview
            storage={storage}
            kubeconfig={kubeconfig}
            setSelected={setSelected}
            hasAuth={hasAuth}
          />
        </WizardStep>
      </Wizard>
      <WizardButtons
        className="cluster-wizard-buttons"
        selectedStep={selected}
        setSelectedStep={setSelected}
        firstStep={selected === 1}
        lastStep={
          kubeconfig && (!hasAuth || !hasOneContext)
            ? selected === 4
            : selected === 3
        }
        onCancel={onCancel}
        customFinish={t('clusters.buttons.connect-cluster')}
        onComplete={onComplete}
        invalid={isCurrentStepInvalid(selected)}
      />
    </>
  );
}
