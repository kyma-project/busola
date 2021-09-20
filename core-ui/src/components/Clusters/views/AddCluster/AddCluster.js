import React, { useEffect, useState, useRef } from 'react';
import LuigiClient from '@luigi-project/client';
import './AddCluster.scss';
import {
  Button,
  Dialog,
  Wizard,
  FormRadioGroup,
  FormRadioItem,
  FormTextarea,
  MessageStrip,
} from 'fundamental-react';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import jsyaml from 'js-yaml';

import {
  PageHeader,
  useNotification,
  useMicrofrontendContext,
} from 'react-shared';
import { useTranslation } from 'react-i18next';
import { AuthForm, AUTH_FORM_TOKEN } from '../../components/AuthForm';
import { KubeconfigUpload } from '../../components/KubeconfigUpload/KubeconfigUpload';
import { ContextChooser } from '../../components/ContextChooser/ContextChooser';
import {
  decompressParams,
  hasKubeconfigAuth,
  getContext,
  addCluster,
} from '../../shared';
import { ChooseStorage } from './ChooseStorage';

export function AddCluster({ show, onCancel }) {
  const { busolaClusterParams } = useMicrofrontendContext();
  const [kubeconfig, setKubeconfig] = useState(undefined);
  const [initParams, setInitParams] = useState(null);
  const [hasAuth, setHasAuth] = useState(false);
  const [authValid, setAuthValid] = useState(false);
  const [hasOneContext, setHasOneContext] = useState(false);
  const [lastStep, setLastStep] = useState(false);
  const [storage, setStorage] = useState(
    busolaClusterParams?.config.defaultStorage || 'localStorage',
  );
  const notification = useNotification();
  const isMounted = useRef();
  const authFormRef = useRef();

  useEffect(() => {
    isMounted.current = true;
    return _ => (isMounted.current = false);
  }, []);
  const { t } = useTranslation();

  const encodedParams = LuigiClient.getNodeParams().init;

  useEffect(() => {
    if (show) {
      setKubeconfig(undefined);
    }
  }, [show]);

  useEffect(() => {
    if (!isMounted.current) return; // avoid state updates on onmounted component
    if (!encodedParams || initParams) return;
    async function setKubeconfigIfPresentInParams() {
      const params = await decompressParams(encodedParams);
      setInitParams(params);
      if (Object.keys(params.kubeconfig || {}).length) {
        console.log('set kubeconfig on params');
        setKubeconfig(params.kubeconfig);
      }
      notification.notifySuccess(
        {
          title: t('clusters.messages.missing-configuration-data'),
          type: 'info',
          icon: '',
          buttonConfirm: false,
          buttonDismiss: 'Ok',
        },
        7500,
      );
    }
    setKubeconfigIfPresentInParams();
  }, [encodedParams, initParams]);

  function updateKubeconfig(kubeconfig) {
    if (!kubeconfig) {
      setKubeconfig(null);
      return;
    }

    const hasOneContext = kubeconfig?.contexts?.length === 1;
    const contextName = kubeconfig['current-context'];
    const hasAuth = hasKubeconfigAuth(
      kubeconfig,
      kubeconfig['current-context'],
    );

    setHasOneContext(hasOneContext);
    setHasAuth(hasAuth);

    setKubeconfig(kubeconfig);
    // }
  }

  const onComplete = () => {
    try {
      const contextName = kubeconfig['current-context'];
      addCluster({
        kubeconfig,
        config: { ...initParams?.config, storage },
        currentContext: getContext(kubeconfig, contextName),
      });
    } catch (e) {
      notification.notifyError({
        title: t('clusters.messages.wrong-configuration'),
        content: t('common.tooltips.error') + e.message,
      });
      console.warn(e);
    }
  };

  return (
    <Dialog
      show={show}
      className="add-cluster-dialog"
      title={t('clusters.add.title')}
      actions={[]}
    >
      <Wizard
        onCancel={onCancel}
        onComplete={onComplete}
        onStepChange={(e, step, index, count) =>
          setLastStep(index === count - 1)
        }
        headerSize="md"
        contentSize="md"
        footerProps={
          lastStep && {
            children: (
              <Button compact option="emphasized" onClick={onComplete}>
                {t('clusters.buttons.verify-and-add')}
              </Button>
            ),
          }
        }
      >
        <Wizard.Step
          title="Choose Configuration"
          branching={!kubeconfig}
          indicator="1"
          valid={!!kubeconfig}
        >
          <MessageStrip
            type="information"
            className="fd-margin-top--sm fd-margin-bottom--sm"
          >
            {t('clusters.add.info')}
          </MessageStrip>
          <KubeconfigUpload
            kubeconfig={kubeconfig}
            setKubeconfig={updateKubeconfig}
          />
        </Wizard.Step>

        {kubeconfig && (!hasAuth || !hasOneContext) && (
          <Wizard.Step
            title="Update Configuration"
            indicator="2"
            valid={authValid}
          >
            <ResourceForm.Single
              formElementRef={authFormRef}
              resource={kubeconfig}
              setResource={setKubeconfig}
              onValid={setAuthValid}
            >
              {!hasOneContext && <ContextChooser />}
              {!hasAuth && <AuthForm onValid={setAuthValid} />}
            </ResourceForm.Single>
          </Wizard.Step>
        )}

        <Wizard.Step
          title="Complete"
          indicator="2"
          nextLabel="Create cluster"
          valid={false}
        >
          <ChooseStorage storage={storage} setStorage={setStorage} />
        </Wizard.Step>
      </Wizard>
    </Dialog>
  );
}
