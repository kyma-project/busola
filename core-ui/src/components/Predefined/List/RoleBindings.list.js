import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { Link } from 'fundamental-react';
import { Tooltip } from 'react-shared';

const navigateToClusterRole = roleName =>
  LuigiClient.linkManager()
    .fromContext('cluster')
    .navigate(`/clusterroles/details/${roleName}`);

const navigateToRole = roleName =>
  LuigiClient.linkManager()
    .fromContext('namespace')
    .navigate(`/roles/details/${roleName}`);

const navigate = (roleName, kind) => {
  if (kind === 'ClusterRole') {
    navigateToClusterRole(roleName);
  } else {
    navigateToRole(roleName);
  }
};

const getSubject = subject => (
  <div>
    {subject.name}{' '}
    <Tooltip content={subject.kind}>({subject.kind?.slice(0, 1)})</Tooltip>
  </div>
);

const getSubjectWithLink = subject => (
  <div>
    <Link
      className="fd-link"
      onClick={() =>
        LuigiClient.linkManager()
          .fromContext('namespaces')
          .navigate(`/serviceaccounts/details/${subject}`)
      } //fix
    >
      {subject.name}
    </Link>
    <Tooltip content={subject.kind}> (SA)</Tooltip>
  </div>
);

const getAllSubjects = binding => {
  return binding.subjects?.map(s =>
    s.kind === 'ServiceAccount' ? getSubjectWithLink(s) : getSubject(s),
  );
};

const getColumns = t => {
  return [
    {
      header: t('role-bindings.headers.role-name'),
      value: binding => (
        <Link
          className="fd-link"
          onClick={() => navigate(binding.roleRef.name, binding.roleRef.kind)}
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
};

const textSearchProperties = [
  'roleRef.name',
  (entry, query) => {
    const matchingSubject = entry.subjects?.find(subject =>
      subject.name.toLowerCase().includes(query.toLowerCase()),
    );
    return matchingSubject?.name || null;
  },
];

export const RoleBindingsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = getColumns(t);

  return (
    <DefaultRenderer
      customColumns={customColumns}
      textSearchProperties={textSearchProperties}
      {...otherParams}
    />
  );
};

export const ClusterRoleBindingsList = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();

  const customColumns = getColumns(t);

  return (
    <DefaultRenderer
      customColumns={customColumns}
      textSearchProperties={textSearchProperties}
      {...otherParams}
    />
  );
};
