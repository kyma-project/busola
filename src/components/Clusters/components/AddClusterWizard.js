import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Wizard,
  WizardStep,
  Title,
  Button,
  Popover,
  Text,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { ResourceForm } from 'shared/ResourceForm';
import { useCustomFormValidator } from 'shared/hooks/useCustomFormValidator/useCustomFormValidator';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { authDataState } from 'state/authDataAtom';
import { showAddClusterWizard } from 'state/showAddClusterWizard';

import { addByContext, getUser, hasKubeconfigAuth } from '../shared';
import { AuthForm } from './AuthForm';
import { KubeconfigUpload } from './KubeconfigUpload/KubeconfigUpload';
import { ContextChooser } from './ContextChooser/ContextChooser';
import { ChooseStorage } from './ChooseStorage';
import { WizardButtons } from 'shared/components/WizardButtons/WizardButtons';
import { ClusterPreview } from './ClusterPreview';

import { spacing } from '@ui5/webcomponents-react-base';
import './AddClusterWizard.scss';
import { isFormOpenState } from 'state/formOpenAtom';

export function AddClusterWizard({ kubeconfig, setKubeconfig, config }) {
  const busolaClusterParams = useRecoilValue(configurationAtom);
  const { t } = useTranslation();
  const notification = useNotification();
  const clustersInfo = useClustersInfo();
  const setAuth = useSetRecoilState(authDataState);

  const [hasAuth, setHasAuth] = useState(false);
  const [hasOneContext, setHasOneContext] = useState(false);
  const [storage, setStorage] = useState(
    busolaClusterParams?.config?.storage || 'sessionStorage',
  );
  const [selected, setSelected] = useState(1);
  const setShowWizard = useSetRecoilState(showAddClusterWizard);
  const [showTitleDescription, setShowTitleDescription] = useState(false);
  const setIsFormOpen = useSetRecoilState(isFormOpenState);

  useEffect(() => {
    const wizard = document.getElementsByTagName('ui5-wizard')[0];
    const wizardContent = wizard?.shadowRoot?.querySelector('.ui5-wiz-content');

    const contentContainer = wizardContent?.querySelectorAll(
      '.ui5-wiz-content-item-wrapper',
    )[selected - 1];

    if (contentContainer) {
      contentContainer.style['background-color'] = 'transparent';
      contentContainer.style['padding'] = '0';
    }
  });

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

  const updateKubeconfig = kubeconfig => {
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
          context => context.name === contextName,
        );
        addByContext({ kubeconfig, context, storage, config }, clustersInfo);
      }
      setIsFormOpen({ formOpen: false });
    } catch (e) {
      notification.notifyError({
        title: t('clusters.messages.wrong-configuration'),
        content: t('common.tooltips.error') + e.message,
      });
      console.warn(e);
    }
    setShowWizard(false);
  };

  const handleStepChange = e => {
    setSelected(Number(e.detail.step.dataset.step));
  };

  return (
    <Wizard contentLayout="SingleStep" onStepChange={handleStepChange}>
      <WizardStep
        titleText={t('configuration.title')}
        branching={!kubeconfig}
        selected={selected === 1}
        data-step={'1'}
      >
        <KubeconfigUpload
          kubeconfig={kubeconfig}
          config={config}
          setKubeconfig={updateKubeconfig}
          formRef={authFormRef}
        />
        <WizardButtons
          selected={selected}
          setSelected={setSelected}
          firstStep={true}
          onCancel={() => setShowWizard(false)}
          validation={!kubeconfig}
          className="cluster-wizard__buttons__sticky"
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
              createResource={e => {
                e.preventDefault();
              }}
              className="cluster-wizard__auth-form"
            >
              {!hasOneContext && <ContextChooser />}
              {!hasAuth && <AuthForm revalidate={revalidate} />}
            </ResourceForm.Single>
          </div>
          <WizardButtons
            selected={selected}
            setSelected={setSelected}
            onCancel={() => setShowWizard(false)}
            validation={!authValid}
            className="cluster-wizard__buttons__absolute"
          />
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
          <Title level="H5" style={spacing.sapUiSmallMarginBottom}>
            {t('clusters.storage.choose-storage.label')}
            <>
              <Button
                id="storageDescriptionOpener"
                icon="hint"
                design="Transparent"
                style={spacing.sapUiTinyMarginBegin}
                onClick={() => setShowTitleDescription(true)}
              />
              {createPortal(
                <Popover
                  opener="storageDescriptionOpener"
                  open={showTitleDescription}
                  onAfterClose={() => setShowTitleDescription(false)}
                  placementType="Right"
                >
                  <Text className="description">
                    {t('clusters.storage.info')}
                  </Text>
                </Popover>,
                document.body,
              )}
            </>
          </Title>
          <ChooseStorage storage={storage} setStorage={setStorage} />
          <WizardButtons
            selected={selected}
            setSelected={setSelected}
            validation={!storage}
            onCancel={() => setShowWizard(false)}
            className="cluster-wizard__buttons__absolute"
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
          token={hasAuth ? hasKubeconfigAuth(kubeconfig) : null}
          setSelected={setSelected}
          hasAuth={hasAuth}
        />
        <WizardButtons
          selected={selected}
          setSelected={setSelected}
          lastStep={true}
          customFinish={t('clusters.buttons.verify-and-add')}
          onComplete={onComplete}
          onCancel={() => {
            setShowWizard(false);
            setIsFormOpen({ formOpen: false });
          }}
          validation={!storage}
          className="cluster-wizard__buttons__absolute"
        />
      </WizardStep>
    </Wizard>
  );
}
