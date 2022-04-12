import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';

export function SubjectLink({ subject }) {
  const navigateToServiceAccount = () => {
    const url = `namespaces/${subject.namespace}/serviceaccounts/details/${subject.name}`;
    LuigiClient.linkManager()
      .fromContext('cluster')
      .navigate(url);
  };

  if (subject.kind === 'ServiceAccount') {
    return (
      <Link className="fd-link" onClick={navigateToServiceAccount}>
        {subject.name}
      </Link>
    );
  } else {
    return subject.name;
  }
}
