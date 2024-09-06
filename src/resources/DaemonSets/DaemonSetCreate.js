import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import * as _ from 'lodash';

import { createDaemonSetTemplate } from './templates';

export default function DaemonSetCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  resource: initialDaemonSet,
  ...props
}) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const [daemonSet, setDaemonSet] = useState(
    _.cloneDeep(initialDaemonSet) || createDaemonSetTemplate(namespaceId),
  );
  const [initialResource] = useState(
    initialDaemonSet || createDaemonSetTemplate(namespaceId),
  );
  const [initialUnchangedResource] = useState(_.cloneDeep(initialDaemonSet));
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
      pluralKind="daemonsets"
      singularName={t('daemon-sets.name_singular')}
      resource={daemonSet}
      initialResource={initialResource}
      initialUnchangedResource={initialUnchangedResource}
      setResource={setDaemonSet}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
