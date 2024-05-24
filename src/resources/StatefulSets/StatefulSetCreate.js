import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import * as _ from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

import { createStatefulSetTemplate } from './templates';

export default function StatefulSetCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialStatefulSet,
  resourceUrl,
  ...props
}) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const [statefulSet, setStatefulSet] = useState(
    _.cloneDeep(initialStatefulSet) || createStatefulSetTemplate(namespaceId),
  );
  const [initialResource] = useState(
    initialStatefulSet || createStatefulSetTemplate(namespaceId),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
      pluralKind="statefulsets"
      singularName={t('stateful-sets.name_singular')}
      resource={statefulSet}
      initialResource={initialResource}
      setResource={setStatefulSet}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
