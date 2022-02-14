import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createAuthorizationPolicyTemplate } from './templates';

const AuthorizationPoliciesCreate = ({
  namespace,
  onChange,
  formElementRef,
  resourceUrl,
  setCustomValid,
}) => {
  const { t } = useTranslation();
  const [authorizationPolicy, setAuthorizationPolicy] = useState(
    createAuthorizationPolicyTemplate(namespace),
  );

  return (
    <ResourceForm
      pluralKind="authorizationpolicies"
      singularName={t('authorizationpolicies.name_singular')}
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
export { AuthorizationPoliciesCreate };
