import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';

export default function KymaModulesCreate({ resource, ...props }) {
  const { t } = useTranslation();
  return (
    <ResourceForm
      {...props}
      pluralKind="kymas"
      singularName={t('kyma-modules.kyma')}
      resource={resource}
      initialResource={resource}
      onlyYaml
      readOnly
    ></ResourceForm>
  );
}
