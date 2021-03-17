import React from 'react';
import CreateNewFunction from './CreateNewFunction';
import { Button } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';

export const FunctionsList = DefaultRenderer => ({ ...otherParams }) => {
  function goToGitRepositories() {
    LuigiClient.linkManager()
      .fromContext('namespaces')
      .navigate(`gitrepositories`);
  }
  const headerActions = (
    <Button option="light" onClick={goToGitRepositories}>
      Connected repositories
    </Button>
  );

  const listActions = (
    <CreateNewFunction namespaceName={otherParams.namespace} />
  );

  return (
    <DefaultRenderer
      customHeaderActions={headerActions}
      listHeaderActions={listActions}
      {...otherParams}
    />
  );
};
