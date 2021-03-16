import React from 'react';
import { Button } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { PANEL } from '../../ApiRules/constants';
import { CopiableApiRuleHost } from 'components/ApiRules/ApiRulesList/components';
import ApiRuleStatus from 'components/ApiRules/ApiRuleStatus/ApiRuleStatus';

export const ApiRulesList = DefaultRenderer => ({ ...otherParams }) => {
  const createApiRule = (
    <Button
      glyph="add"
      option="light"
      onClick={() =>
        LuigiClient.linkManager()
          .fromContext('namespaces')
          .withParams({
            serviceName: otherParams.serviceName,
            port: otherParams.port,
            openedInModal: true,
            redirectCtx: 'namespaces',
            redirectPath: encodeURIComponent('apirules/'),
          })
          .openAsModal(`apirules/create`, {
            title: PANEL.CREATE_MODAL.TITLE,
          })
      }
    >
      Create apirules
    </Button>
  );
  const customColumns = [
    {
      header: 'Host',
      value: apiRule => <CopiableApiRuleHost apiRule={apiRule} />,
    },
    {
      header: 'Status',
      value: apiRule => <ApiRuleStatus apiRule={apiRule} />,
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      listHeaderActions={createApiRule}
      {...otherParams}
    />
  );
};
