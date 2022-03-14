import React from 'react';
import LuigiClient from '@luigi-project/client';
import { StatusBadge, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { Link } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { Link as ReactSharedLink } from 'react-shared';
import { Trans } from 'react-i18next';

export const GitRepositoriesList = ({ DefaultRenderer, ...otherParams }) => {
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

  const description = (
    <Trans i18nKey="git-repositories.description">
      <ReactSharedLink
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/05-technical-reference/00-custom-resources/svls-02-gitrepository#documentation-content"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      resourceName={t('git-repositories.title')}
      customColumns={customColumns}
      createActionLabel={t('git-repositories.labels.create')}
      description={description}
      {...otherParams}
    />
  );
};
