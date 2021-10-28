import React from 'react';
import LuigiClient from '@luigi-project/client';
import { StatusBadge } from 'react-shared';
import { Link } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

export const GitRepositoriesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('git-repositories.labels.url'),
      value: repo => repo.spec.url,
    },
    {
      header: t('git-repositories.labels.auth'),
      value: repo => (
        <StatusBadge type="info">{repo.spec.auth?.type || 'none'}</StatusBadge>
      ),
    },
    {
      header: t('git-repositories.labels.secret'),
      value: repo => {
        if (!repo.spec.auth) return '-';
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
    <DefaultRenderer
      customColumns={customColumns}
      createActionLabel={t('git-repositories.labels.create')}
      {...otherParams}
    />
  );
};
