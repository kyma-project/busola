import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import {
  StatusBadge,
  EMPTY_TEXT_PLACEHOLDER,
  ResourceDetails,
} from 'react-shared';
import { GitRepositoriesCreate } from '../Create/GitRepositories/GitRepositories.create';
import { useTranslation } from 'react-i18next';

const GitRepositoriesDetails = props => {
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
      createResourceForm={GitRepositoriesCreate}
      customColumns={customColumns}
    />
  );
};

export default GitRepositoriesDetails;
