import React from 'react';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const AuthorizationPoliciesList = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const description = (
    <Trans i18nKey="authorizationpolicies.description">
      <Link
        className="fd-link"
        url="https://istio.io/latest/docs/reference/config/security/authorization-policy/"
      />
    </Trans>
  );

  return <DefaultRenderer description={description} {...otherParams} />;
};
