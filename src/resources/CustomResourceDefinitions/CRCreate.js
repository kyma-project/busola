import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { usePrepareLayout } from 'shared/hooks/usePrepareLayout';

import { useCustomResourceUrl } from 'resources/CustomResourceDefinitions/useCustomResourceUrl';

import { createTemplate } from './templates';
import { useTranslation } from 'react-i18next';
import { useNotification } from 'shared/contexts/NotificationContext';
import { BusyIndicator } from '@ui5/webcomponents-react';
import { useRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';

function CRCreateForm({
  onChange,
  formElementRef,
  crd,
  layoutNumber,
  resource: initialCustomResource,
  ...props
}) {
  const { crdName } = useParams();
  const [layoutColumn, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { t } = useTranslation();
  const notification = useNotification();
  const [cr, setCr] = useState(
    cloneDeep(initialCustomResource) || createTemplate(crd),
  );
  const [initialResource, setInitialResource] = useState(
    initialCustomResource || createTemplate(crd),
  );

  useEffect(() => {
    setCr(cloneDeep(initialCustomResource) || createTemplate(crd));
    setInitialResource(initialCustomResource || createTemplate(crd));
  }, [initialCustomResource, crd]);

  const isEdit = useMemo(() => !!initialResource?.metadata?.name, [
    initialResource,
  ]);

  const customUrl = useCustomResourceUrl(crd);

  const navigate = useNavigate();
  const { nextQuery } = usePrepareLayout(layoutNumber);

  const currentVersion = crd.spec.versions?.find(ver => ver.storage).name;
  const namespace =
    crd.spec.scope === 'Namespaced'
      ? `/namespaces/${cr.metadata?.namespace || ''}`
      : '';
  const createUrlResourceName = !!initialCustomResource?.metadata?.name
    ? '/' + initialCustomResource.metadata.name
    : '';

  const createUrl = `/apis/${crd.spec?.group ||
    ''}/${currentVersion}${namespace}/${
    crd.spec.names.plural
  }${createUrlResourceName}`;

  return (
    <ResourceForm
      {...props}
      pluralKind={crd.spec.names.plural}
      singularName={crd.spec.names.kind}
      resource={cr}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setCr}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={createUrl}
      onlyYaml
      layoutNumber={layoutNumber}
      afterCreatedFn={() => {
        notification.notifySuccess({
          content: t(
            isEdit
              ? 'common.create-form.messages.patch-success'
              : 'common.create-form.messages.create-success',
            {
              resourceType: crd.spec.names.kind,
            },
          ),
        });
        navigate(`${customUrl(cr)}${nextQuery}`);
        setLayoutColumn({
          ...layoutColumn,
          showCreate: null,
          endColumn: {
            resourceName: cr.metadata.name,
            resourceType: crdName,
            namespaceId: cr.metadata.namespace,
          },
        });
      }}
    />
  );
}

function CRCreate({
  onChange,
  formElementRef,
  crd,
  layoutNumber,
  resource: initialCustomResource,
  ...props
}) {
  if (!crd) {
    return (
      <BusyIndicator
        active
        size="M"
        delay={0}
        className="sap-margin-top-small"
      />
    );
  }

  return (
    <CRCreateForm
      onChange={onChange}
      formElementRef={formElementRef}
      crd={crd}
      layoutNumber={layoutNumber}
      resource={initialCustomResource}
      {...props}
    />
  );
}

export default CRCreate;
