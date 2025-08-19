import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { useUrl } from 'hooks/useUrl';
import { Link } from 'shared/components/Link/Link';

export function GenericRoleBindingList({
  description,
  descriptionKey,
  ...props
}) {
  const { t } = useTranslation();
  const { clusterUrl, namespaceUrl } = useUrl();

  const navigateToRole = role => {
    if (role.kind === 'ClusterRole') {
      return clusterUrl(`clusterroles/${role.name}`);
    } else {
      return namespaceUrl(`roles/${role.name}`);
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
        url={namespaceUrl(`serviceaccounts/${subject.name}`, {
          namespace: subject.namespace,
        })}
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
        <Link url={navigateToRole(binding.roleRef)}>
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
        subject.name.toLowerCase().includes(query?.toLowerCase()),
      );
      return matchingSubject?.name || null;
    },
  ];

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      searchSettings={{
        textSearchProperties,
      }}
      {...props}
      emptyListProps={{
        subtitleText: descriptionKey,
        url:
          'https://kyma-project.io/docs/kyma/latest/04-operation-guides/security/sec-02-authorization-in-kyma/#role-binding',
      }}
    />
  );
}
