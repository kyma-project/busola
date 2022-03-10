import React, { useState } from 'react';
import { useMicrofrontendContext, matchByOwnerReference } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createDaemonSetTemplate } from './templates';

function DaemonSetsCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [daemonSet, setDaemonSet] = useState(
    createDaemonSetTemplate(namespaceId),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      pluralKind="daemonsets"
      singularName={t('daemon-sets.name_singular')}
      resource={daemonSet}
      setResource={setDaemonSet}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
DaemonSetsCreate.resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'Pod',
    },
  ],
  matchers: {
    Pod: (ds, pod) =>
      matchByOwnerReference({
        resource: pod,
        owner: ds,
      }),
  },
});
export { DaemonSetsCreate };
