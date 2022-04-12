import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import { GitRepositoryCreate } from './GitRepositoryCreate';

export function GitRepositoryDetails(props) {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('git-repositories.labels.url'),
      value: repo => repo.spec.url,
    },
    {
      header: t('git-repositories.labels.auth'),
      value: repo => (
        <StatusBadge i18n={i18n} resourceKind="git-repositories" type="info">
          {repo.spec.auth?.type || 'none'}
        </StatusBadge>
      ),
    },
    {
      header: t('git-repositories.labels.secret'),
      value: repo => {
        if (!repo.spec.auth) return EMPTY_TEXT_PLACEHOLDER;
        const secretName = repo.spec.auth.secretName;
        return (
          <Link
            className="fd-link"
            onClick={() =>
              LuigiClient.linkManager()
                .fromContext('namespace')
                .navigate(`secrets/details/${secretName}`)
            }
          >
            {secretName}
          </Link>
        );
      },
    },
  ];

  return (
    <ResourceDetails
      {...props}
      createResourceForm={GitRepositoryCreate}
      customColumns={customColumns}
    />
  );
}

export default GitRepositoryDetails;
