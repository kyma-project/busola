import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';
import { showYamlTab } from './index';
export default function EventCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialEvent,
  resourceUrl,
  ...props
}) {
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
      pluralKind="events"
      singularName={t('events.name_singular')}
      resource={initialEvent}
      initialResource={initialEvent}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml={!!showYamlTab}
    />
  );
}
