import { Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

export function GenericRoleList({ descriptionKey, ...otherParams }) {
  const description = (
    <Trans i18nKey={descriptionKey}>
      <ExternalLink
        className="bsl-link"
        url="https://kyma-project.io/docs/kyma/latest/04-operation-guides/security/sec-02-authorization-in-kyma/#user-authorization"
      />
    </Trans>
  );

  return (
    <ResourcesList
      description={description}
      {...otherParams}
      emptyListProps={{
        subtitleText: descriptionKey,
        url:
          'https://kyma-project.io/docs/kyma/latest/04-operation-guides/security/sec-02-authorization-in-kyma/#user-authorization',
      }}
    />
  );
}
