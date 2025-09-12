import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Wizard, WizardStep, Title } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';

import { ResourceForm } from 'shared/ResourceForm';
import { useCustomFormValidator } from 'shared/hooks/useCustomFormValidator/useCustomFormValidator';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { authDataAtom } from 'state/authDataAtom';
import { showAddClusterWizardAtom } from 'state/showAddClusterWizardAtom';
import { isFormOpenAtom } from 'state/formOpenAtom';
import { checkAuthRequiredInputs } from '../helper';

import { addByContext, getUser, hasKubeconfigAuth } from '../shared';
import { AuthForm } from './AuthForm';
import { KubeconfigUpload } from './KubeconfigUpload/KubeconfigUpload';
import { ContextChooser } from './ContextChooser/ContextChooser';
import { ChooseStorage } from './ChooseStorage';
import { WizardButtons } from 'shared/components/WizardButtons/WizardButtons';
import { ClusterPreview } from './ClusterPreview';

import './AddClusterWizard.scss';
import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';

export function AddClusterWizard({
  kubeconfig,
  setKubeconfig,
  dialogRef,
  config = {},
}) {
  const busolaClusterParams = useAtomValue(configurationAtom);
  const { t } = useTranslation();
  const notification = useNotification();
  const clustersInfo = useClustersInfo();
  const setAuth = useSetAtom(authDataAtom);

  const [hasAuth, setHasAuth] = useState(false);
  const [hasOneContext, setHasOneContext] = useState(false);
  const [storage, setStorage] = useState(
    busolaClusterParams?.config?.storage || 'sessionStorage',
  );
  const [selected, setSelected] = useState(1);
  const setShowWizard = useSetAtom(showAddClusterWizardAtom);
  const [showTitleDescription, setShowTitleDescription] = useState(false);
  const setIsFormOpen = useSetAtom(isFormOpenAtom);
  const [chosenContext, setChosenContext] = useState(undefined);
  const [hasInvalidInputs, setHasInvalidInputs] = useState(false);

  const {
    isValid: authValid,
    formElementRef: authFormRef,
    setCustomValid,
    revalidate,
  } = useCustomFormValidator();

  useEffect(() => {
    if (Array.isArray(kubeconfig?.contexts)) {
      if (getUser(kubeconfig)?.token) {
        setStorage('sessionStorage');
      } else {
        setStorage('localStorage');
      }
    }
  }, [kubeconfig]);

  const updateKubeconfig = (kubeconfig) => {
    if (!kubeconfig) {
      setKubeconfig(null);
      return;
    }

    const hasOneContext = kubeconfig?.contexts?.length === 1;
    const hasAuth = hasKubeconfigAuth(kubeconfig);
    setHasOneContext(hasOneContext);
    setHasAuth(hasAuth);

    setKubeconfig(kubeconfig);
  };

  const onComplete = () => {
    try {
      setAuth(null);
      const contextName = kubeconfig['current-context'];
      if (!kubeconfig.contexts?.length) {
        addByContext(
          {
            kubeconfig,
            context: {
              name: kubeconfig.clusters[0].name,
              context: {
                cluster: kubeconfig.clusters[0].name,
                user: kubeconfig.users[0].name,
              },
            },

            storage,
            config,
          },
          clustersInfo,
        );
      } else if (contextName === '-all-') {
        kubeconfig.contexts.forEach((context, index) => {
          addByContext(
            {
              kubeconfig,
              context,
              switchCluster: !index,
              storage,
              config,
            },
            clustersInfo,
          );
        });
      } else {
        const context = kubeconfig.contexts.find(
          (context) => context.name === contextName,
        );
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
  };

  const handleStepChange = (e) => {
    setSelected(Number(e.detail.step.dataset.step));
  };

  const isCurrentStepInvalid = (step) => {
    const invalidMultipleContexts = !hasOneContext && !chosenContext;
    switch (step) {
      case 1:
        return !kubeconfig;
      case 2:
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
            titleText={t('clusters.wizard.authentication')}
            selected={selected === 2}
            disabled={selected !== 2}
            data-step={'2'}
          >
            <div className="cluster-wizard__auth-container">
              <ResourceForm.Single
                formElementRef={authFormRef}
                resource={kubeconfig}
                setResource={setKubeconfig}
                setCustomValid={setCustomValid}
                createResource={(e) => {
                  e.preventDefault();
                }}
                className="cluster-wizard__auth-form"
              >
                {!hasOneContext && (
                  <ContextChooser
                    chosenContext={chosenContext}
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
            <ChooseStorage storage={storage} setStorage={setStorage} />
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
      {dialogRef?.current &&
        createPortal(
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
            onCancel={() => setShowWizard(false)}
            customFinish={t('clusters.buttons.connect-cluster')}
            onComplete={onComplete}
            invalid={isCurrentStepInvalid(selected)}
          />,
          dialogRef.current,
        )}
    </>
  );
}
