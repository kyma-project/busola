import React, { useState } from 'react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { matchByOwnerReference } from 'shared/utils/helpers';
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
  networkFlowKind: true,
  networkFlowLevel: -1,
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
