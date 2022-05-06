import React from 'react';
import PropTypes from 'prop-types';

import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { Spinner } from 'shared/components/Spinner/Spinner';
import ApiRuleForm from '../ApiRuleForm/ApiRuleForm';
import EntryNotFound from 'components/EntryNotFound/EntryNotFound';
import { formatMessage as injectVariables } from 'components/Functions/helpers/misc';
import { API_RULE_URL } from '../constants';

EditApiRule.propTypes = {
  apiName: PropTypes.string.isRequired,
};

export default function EditApiRule({ apiName }) {
  const updateApiRule = useUpdate();
  const { namespaceId: namespace } = useMicrofrontendContext();

  const { data, error, loading = true } = useGet(
    injectVariables(API_RULE_URL, {
      namespace,
      name: apiName,
    }),
    { pollingInterval: 0 },
  );

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <h1>Couldn't fetch API rule data</h1>;
  }

  if (!data || !data.spec) {
    return <EntryNotFound entryType="API Rule" entryId={apiName} />;
  }

  const breadcrumbItems = [
    { name: 'API Rules', path: '/' },
    { name: apiName, path: `/details/${apiName}` },
    { name: '' },
  ];

  return (
    <ApiRuleForm
      apiRule={data}
      sendRequest={updateApiRule}
      saveButtonText="Save"
      headerTitle={`Edit ${apiName}`}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
