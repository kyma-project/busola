import { FormEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';

import * as Inputs from 'shared/ResourceForm/inputs';
import { useUpsert } from 'shared/hooks/BackendAPI/useUpsert';
import { useNotification } from 'shared/contexts/NotificationContext';
import { ResourceForm } from 'shared/ResourceForm';
import { ResourceFormProps } from 'shared/ResourceForm/components/ResourceForm';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';

import {
  createConfigmap,
  createConfigMapTemplate,
  createExtensibilityTemplate,
} from './helpers';
import { ColumnsInput } from './ColumnsInput';
import './ExtensibilityStarterForm.scss';
import { clusterAtom } from 'state/clusterAtom';
import { usePrepareLayout } from 'shared/hooks/usePrepareLayout';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { useNavigate } from 'react-router';
import { Crd, LayoutColumnName } from 'types';
import FCLLayout from '@ui5/webcomponents-fiori/dist/types/FCLLayout.js';

type BusolaExtensionCreateProps = Pick<
  ResourceFormProps,
  'formElementRef' | 'onChange' | 'setCustomValid' | 'stickyHeaderHeight'
> & {
  layoutNumber: LayoutColumnName;
};

export default function BusolaExtensionCreate({
  formElementRef,
  onChange,
  setCustomValid,
  stickyHeaderHeight,
  layoutNumber,
}: BusolaExtensionCreateProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notificationManager = useNotification();
  const upsert = useUpsert();
  const cluster = useAtomValue(clusterAtom);
  const setLayoutColumn = useSetAtom(columnLayoutAtom);

  const { nextQuery, nextLayout } = usePrepareLayout(layoutNumber);

  const { data: crds } = useGetList()(
    '/apis/apiextensions.k8s.io/v1/customresourcedefinitions',
  ) as { data: Crd[] | null; loading: boolean; error: null };
  const [crd, setCrd] = useState<Crd | null>(null);
  const [state, setState] = useState({});

  const [initialConfigMap] = useState(() =>
    createConfigMapTemplate('kube-public'),
  );
  const configMap = useMemo(
    () => (crd ? createConfigmap(crd, state) : initialConfigMap),
    [crd, state, initialConfigMap],
  );

  // ResourceForm only calls this when reverting
  const resetForm = () => {
    setCrd(null);
    setState({});
  };

  const createExtension = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // the combobox also accepts text that matches no CRD
    if (!crd) {
      notificationManager.notifyError({
        content: t('common.messages.must-fill-required'),
      });
      return;
    }

    const onError = (e: Error) =>
      notificationManager.notifyError({
        content: t('common.messages.error', { error: e.message }),
        header: t('extensibility.starter-modal.messages.error'),
      });

    const onSuccess = () => {
      notificationManager.notifySuccess({
        content: t('extensibility.starter-modal.messages.success'),
      });

      setLayoutColumn({
        layout: nextLayout as FCLLayout,
        showCreate: null,
        startColumn: {
          resourceName: null,
          resourceType: 'Extensions',
          rawResourceTypeName: 'ConfigMap',
          namespaceId: 'kube-public',
        },
        midColumn: {
          resourceName: crd.metadata.name,
          resourceType: 'Extensions',
          rawResourceTypeName: 'ConfigMap',
          namespaceId: 'kube-public',
        },
        endColumn: null,
      });
      navigate(
        `/cluster/${cluster?.contextName}/busolaextensions/kube-public/${crd.metadata.name}${nextQuery}`,
      );
    };

    await upsert({
      url: '/api/v1/namespaces/kube-public/configmaps',
      resource: configMap,
      onSuccess,
      onError,
    });
  };

  return (
    <ResourceForm
      singularName={t('config-maps.name_singular')}
      resource={configMap}
      initialResource={initialConfigMap}
      setResource={resetForm}
      onChange={onChange}
      formElementRef={formElementRef}
      setCustomValid={setCustomValid}
      stickyHeaderHeight={stickyHeaderHeight}
      onSubmit={createExtension}
      disableDefaultFields
      initialMode="MODE_FORM"
      modeSelectorDisabled
    >
      <ResourceForm.Wrapper resource={state} setResource={setState}>
        <ResourceForm.FormField
          updatesOnInput={false}
          required
          label={t('extensibility.starter-modal.crd')}
          value={crd?.metadata.name ?? ''}
          setValue={(value: string) => {
            const crd = crds?.find((crd) => crd.metadata.name === value);
            if (crd) {
              setCrd(crd);
              setState(createExtensibilityTemplate(crd, t));
            }
          }}
          input={Inputs.ComboboxInput}
          options={(crds ?? []).map((crd) => ({
            key: crd.metadata.name,
            text: crd.metadata.name,
          }))}
          id="combobox-input"
        />
        {crd && (
          <>
            <ResourceForm.FormField
              required
              propertyPath="$.general.name"
              label={t('common.labels.name')}
              input={Inputs.Text}
            />
            <ResourceForm.FormField
              required
              propertyPath="$.general.category"
              label={t('common.labels.category')}
              input={Inputs.Text}
            />
            <ResourceForm.CollapsibleSection
              title={t('extensibility.starter-modal.headers.form-fields')}
            >
              <ColumnsInput propertyPath="$.form" />
            </ResourceForm.CollapsibleSection>
            <ResourceForm.CollapsibleSection
              title={t('extensibility.starter-modal.headers.list-columns')}
            >
              <ColumnsInput propertyPath="$.list" />
            </ResourceForm.CollapsibleSection>
            <ResourceForm.CollapsibleSection
              title={t('extensibility.starter-modal.headers.details-summary')}
            >
              <ColumnsInput propertyPath="$.details.body[0].children" />
            </ResourceForm.CollapsibleSection>
          </>
        )}
      </ResourceForm.Wrapper>
    </ResourceForm>
  );
}
