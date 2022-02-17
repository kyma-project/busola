import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createServiceEntryTemplate } from './templates';

function ServiceEntriesCreate({
  formElementRef,
  onChange,
  resourceUrl,
  setCustomValid,
  namespace,
}) {
  const { t } = useTranslation();
  const [serviceEntry, setServiceEntry] = useState(
    createServiceEntryTemplate(namespace),
  );
  return (
    <ResourceForm
      pluralKind="serviceentries"
      singularName={t('serviceentries.name_singular')}
      resource={serviceEntry}
      setResource={setServiceEntry}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}

export { ServiceEntriesCreate };
