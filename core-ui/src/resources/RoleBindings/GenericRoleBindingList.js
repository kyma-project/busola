import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'fundamental-react';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Link as ReactSharedLink } from 'shared/components/Link/Link';

export function GenericRoleBindingList({ descriptionKey, ...params }) {
  const { t } = useTranslation();

  const navigateToRole = role => {
    if (role.kind === 'ClusterRole') {
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(`/clusterroles/details/${role.name}`);
    } else {
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(`/roles/details/${role.name}`);
    }
  };

  const getSubject = subject => (
    <div key={subject.kind + ' ' + subject.name}>
      {subject.name}{' '}
      <Tooltip delay={0} content={subject.kind}>
        ({subject.kind?.slice(0, 1)})
      </Tooltip>
    </div>
  );

  const getSubjectWithLink = subject => (
    <div key={subject.kind + ' ' + subject.name}>
      <Link
        className="fd-link"
        onClick={() =>
          LuigiClient.linkManager()
            .fromContext('cluster')
            .navigate(
              `/namespaces/${subject.namespace}/serviceaccounts/details/${subject.name}`,
            )
        }
      >
        {subject.name}
      </Link>
      <Tooltip delay={0} content={subject.kind}>
        {' '}
        (SA)
      </Tooltip>
    </div>
  );

  const getAllSubjects = binding => {
    return binding.subjects?.map(subject =>
      subject.kind === 'ServiceAccount'
        ? getSubjectWithLink(subject)
        : getSubject(subject),
    );
  };

  const customColumns = [
    {
      header: t('role-bindings.headers.role-ref'),
      value: binding => (
        <Link
          className="fd-link"
          onClick={() => navigateToRole(binding.roleRef)}
        >
          {binding.roleRef.name}
        </Link>
      ),
    },
    {
      header: t('role-bindings.headers.subjects'),
      value: binding => getAllSubjects(binding),
    },
  ];

  const textSearchProperties = [
    'roleRef.name',
    (entry, query) => {
      const matchingSubject = entry.subjects?.find(subject =>
        subject.name.toLowerCase().includes(query.toLowerCase()),
      );
      return matchingSubject?.name || null;
    },
  ];

  const description = (
    <Trans i18nKey={descriptionKey}>
      <ReactSharedLink
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/04-operation-guides/security/sec-02-authorization-in-kyma/#role-binding"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      textSearchProperties={textSearchProperties}
      {...params}
    />
  );
}
