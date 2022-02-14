import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createServiceEntryTemplate } from './templates';

function ServiceEntriesCreate({
  formElementRef,
  onChange,
  resourceUrl,
  setCustomValid,
}) {
  const { t } = useTranslation();
  const [serviceEntry, setServiceEntry] = useState(
    createServiceEntryTemplate(),
  );

  return (
    <ResourceForm
      pluralKind="serviceentries"
      singularName={t('service-entries.name_singular')}
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
