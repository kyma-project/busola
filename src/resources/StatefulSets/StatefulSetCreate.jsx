import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import * as _ from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';

import { createStatefulSetTemplate } from './templates';

export default function StatefulSetCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialStatefulSet,
  resourceUrl,
  ...props
}) {
  const { t } = useTranslation();

  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const [statefulSet, setStatefulSet] = useState(
    _.cloneDeep(initialStatefulSet) || createStatefulSetTemplate(namespaceId),
  );

  const [initialResource, setInitialResource] = useState(
    initialStatefulSet || createStatefulSetTemplate(namespaceId),
  );

  useEffect(() => {
    //statefulSet cannot be converted to useMemo
    //eslint-disable-next-line react-hooks/set-state-in-effect
    setStatefulSet(
      _.cloneDeep(initialStatefulSet) || createStatefulSetTemplate(namespaceId),
    );
    setInitialResource(
      initialStatefulSet || createStatefulSetTemplate(namespaceId),
    );
  }, [initialStatefulSet, namespaceId]);

  return (
    <ResourceForm
      {...props}
      pluralKind="statefulsets"
      singularName={t('stateful-sets.name_singular')}
      resource={statefulSet}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setStatefulSet}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
