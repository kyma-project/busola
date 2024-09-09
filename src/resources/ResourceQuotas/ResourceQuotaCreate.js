import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import * as _ from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

import { createResourceQuotaTemplate } from './templates';

export default function ResourceQuotaCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  resource: initialResourceQuota,

  ...props
}) {
  const { t } = useTranslation();
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const [resourceQuota, setResourceQuota] = useState(
    _.cloneDeep(initialResourceQuota) ||
      createResourceQuotaTemplate({ namespaceName: namespaceId }),
  );
  const [initialResource] = useState(
    initialResourceQuota ||
      createResourceQuotaTemplate({ namespaceName: namespaceId }),
  );

  const [initialUnchangedResource] = useState(
    _.cloneDeep(initialResourceQuota),
  );

  return (
    <ResourceForm
      {...props}
      pluralKind="resourceQuotas"
      singularName={t('resource-quotas.name_singular')}
      resource={resourceQuota}
      initialResource={initialResource}
      initialUnchangedResource={initialUnchangedResource}
      setResource={setResourceQuota}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
