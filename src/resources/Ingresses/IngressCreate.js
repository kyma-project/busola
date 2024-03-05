import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as _ from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { createIngressTemplate } from './templates';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

export default function IngressCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  resource: initialIngress,
  ...props
}) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const [ingress, setIngress] = useState(
    _.cloneDeep(initialIngress) || createIngressTemplate(namespaceId),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
      pluralKind="ingresses"
      singularName={t('ingresses.name_singular')}
      resource={ingress}
      initialResource={initialIngress}
      setResource={setIngress}
      onlyYaml
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    />
  );
}
