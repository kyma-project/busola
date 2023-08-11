import React from 'react';
import { Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';

export function GenericRoleList({ descriptionKey, ...otherParams }) {
  const description = (
    <Trans i18nKey={descriptionKey}>
      <Link
        className="fd-link"
        url="https://kyma-project.io/#/04-operation-guides/security/sec-02-authorization-in-kyma?id=user-authorization"
      />
    </Trans>
  );

  return <ResourcesList description={description} {...otherParams} />;
}
