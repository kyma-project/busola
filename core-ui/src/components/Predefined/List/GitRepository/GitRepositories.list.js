import React from 'react';
import LuigiClient from '@luigi-project/client';
import CreateNewRepository from './CreateNewRepository';
import { StatusBadge } from 'react-shared';
import { Link } from 'fundamental-react';

export const GitRepositoriesList = ({ DefaultRenderer, ...otherParams }) => {
  const listActions = (
    <CreateNewRepository namespaceName={otherParams.resourceName} />
  );

  const customColumns = [
    {
      header: 'Repository URL',
      value: repo => repo.spec.url,
    },
    {
      header: 'Authentication',
      value: repo => (
        <StatusBadge type="info">{repo.spec.auth?.type || 'none'}</StatusBadge>
      ),
    },
    {
      header: 'Secret',
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
      listHeaderActions={listActions}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
