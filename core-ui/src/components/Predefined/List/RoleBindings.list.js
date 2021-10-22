import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { Link } from 'fundamental-react';
import { Tooltip } from 'react-shared';

const BindingsList = ({ DefaultRenderer, ...otherParams }) => {
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
    <div>
      {subject.name}{' '}
      <Tooltip delay={0} content={subject.kind}>
        ({subject.kind?.slice(0, 1)})
      </Tooltip>
    </div>
  );

  const getSubjectWithLink = subject => (
    <div>
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
      header: t('role-bindings.headers.role-name'),
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
      header: 'Subjects',
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

  return (
    <DefaultRenderer
      customColumns={customColumns}
      textSearchProperties={textSearchProperties}
      {...otherParams}
    />
  );
};

export const RoleBindingsList = ({ DefaultRenderer, ...otherParams }) => {
  return <BindingsList DefaultRenderer={DefaultRenderer} {...otherParams} />;
};

export const ClusterRoleBindingsList = ({
  DefaultRenderer,
  ...otherParams
}) => {
  return <BindingsList DefaultRenderer={DefaultRenderer} {...otherParams} />;
};
