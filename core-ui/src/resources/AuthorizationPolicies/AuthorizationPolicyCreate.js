import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';

import { createAuthorizationPolicyTemplate } from './templates';

export const AuthorizationPolicyCreate = ({
  namespace,
  onChange,
  formElementRef,
  resourceUrl,
  setCustomValid,
  ...props
}) => {
  const { t } = useTranslation();
  const [authorizationPolicy, setAuthorizationPolicy] = useState(
    createAuthorizationPolicyTemplate(namespace),
  );

  return (
    <ResourceForm
      {...props}
      pluralKind="authorizationpolicies"
      singularName={t('authorization-policies.name_singular')}
      resource={authorizationPolicy}
      setResource={setAuthorizationPolicy}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    ></ResourceForm>
  );
};
