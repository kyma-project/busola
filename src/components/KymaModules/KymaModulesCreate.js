import { cloneDeep } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';

export default function KymaModulesCreate({ resource, ...props }) {
  const { t } = useTranslation();
  const [kymaResource, setKymaResource] = useState(cloneDeep(resource));
  const [initialResource] = useState(resource);
  const [initialUnchangedResource] = useState(resource);

  return (
    <ResourceForm
      {...props}
      pluralKind="kymas"
      singularName={t('kyma-modules.kyma')}
      resource={kymaResource}
      initialResource={initialResource}
      initialUnchangedResource={initialUnchangedResource}
      setResource={setKymaResource}
      createUrl={props.resourceUrl}
      onlyYaml
    />
  );
}
