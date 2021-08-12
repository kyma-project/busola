import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';

import { Icon, InfoLabel } from 'fundamental-react';
import { GenericList, Tooltip, useGetList } from 'react-shared';

import CreateVariable from './CreateVariable/CreateVariable';
import EditVariable from './EditVariable/EditVariable';

import {
  VARIABLE_VALIDATION,
  VARIABLE_TYPE,
  WARNINGS_VARIABLE_VALIDATION,
} from 'components/Lambdas/helpers/lambdaVariables';
import { ENVIRONMENT_VARIABLES_PANEL } from 'components/Lambdas/constants';
import { useUpdateLambda, UPDATE_TYPE } from 'components/Lambdas/hooks';

import { validateVariables } from './validation';

import './LambdaEnvs.scss';
import { formatMessage } from 'components/Lambdas/helpers/misc';
import { useTranslation } from 'react-i18next';

const headerRenderer = () => [
  'Variable Name',
  '',
  'Value',
  'Source',
  'Key',
  '',
];
const textSearchProperties = ['name', 'value', 'type'];

function VariableStatus({ validation }) {
  if (!WARNINGS_VARIABLE_VALIDATION.includes(validation)) {
    return null;
  }

  const statusClassName = 'fd-has-color-status-2';
  const control = (
    <div>
      <span className={statusClassName}>
        {ENVIRONMENT_VARIABLES_PANEL.WARNINGS.TEXT}
      </span>
      <Icon
        ariaLabel="Warning"
        glyph="message-warning"
        size="s"
        className={`${statusClassName} fd-margin-begin--tiny`}
      />
    </div>
  );

  let message = '';
  switch (validation) {
    case VARIABLE_VALIDATION.CAN_OVERRIDE_SBU: {
      message = ENVIRONMENT_VARIABLES_PANEL.WARNINGS.VARIABLE_CAN_OVERRIDE_SBU;
      break;
    }
    case VARIABLE_VALIDATION.CAN_OVERRIDE_BY_CUSTOM_ENV_AND_SBU: {
      message =
        ENVIRONMENT_VARIABLES_PANEL.WARNINGS.SBU_CAN_BE_OVERRIDE
          .BY_CUSTOM_ENV_AND_SBU;
      break;
    }
    case VARIABLE_VALIDATION.CAN_OVERRIDE_BY_CUSTOM_ENV: {
      message =
        ENVIRONMENT_VARIABLES_PANEL.WARNINGS.SBU_CAN_BE_OVERRIDE.BY_CUSTOM_ENV;
      break;
    }
    case VARIABLE_VALIDATION.CAN_OVERRIDE_BY_SBU: {
      message = ENVIRONMENT_VARIABLES_PANEL.WARNINGS.SBU_CAN_BE_OVERRIDE.BY_SBU;
      break;
    }
    default: {
      message = ENVIRONMENT_VARIABLES_PANEL.WARNINGS.VARIABLE_CAN_OVERRIDE_SBU;
    }
  }

  return <Tooltip content={message}>{control}</Tooltip>;
}

function VariableSource({ variable }) {
  let source = ENVIRONMENT_VARIABLES_PANEL.VARIABLE_TYPE.CUSTOM.TEXT;
  let tooltipTitle =
    ENVIRONMENT_VARIABLES_PANEL.VARIABLE_TYPE.CUSTOM.TOOLTIP_MESSAGE;

  if (variable.type === VARIABLE_TYPE.BINDING_USAGE) {
    source = ENVIRONMENT_VARIABLES_PANEL.VARIABLE_TYPE.BINDING_USAGE.TEXT;
    tooltipTitle = formatMessage(
      ENVIRONMENT_VARIABLES_PANEL.VARIABLE_TYPE.BINDING_USAGE.TOOLTIP_MESSAGE,
      {
        serviceInstanceName: variable.serviceInstanceName,
      },
    );
  }

  if (variable.valueFrom) {
    if (variable.valueFrom.configMapKeyRef) {
      source = ENVIRONMENT_VARIABLES_PANEL.VARIABLE_TYPE.CONFIG_MAP.TEXT;
      tooltipTitle = formatMessage(
        ENVIRONMENT_VARIABLES_PANEL.VARIABLE_TYPE.CONFIG_MAP.TOOLTIP_MESSAGE,
        {
          resourceName: variable.valueFrom.configMapKeyRef.name,
        },
      );
    }
    if (variable.valueFrom.secretKeyRef) {
      source = ENVIRONMENT_VARIABLES_PANEL.VARIABLE_TYPE.SECRET.TEXT;
      tooltipTitle = formatMessage(
        ENVIRONMENT_VARIABLES_PANEL.VARIABLE_TYPE.SECRET.TOOLTIP_MESSAGE,
        {
          resourceName: variable.valueFrom.secretKeyRef.name,
        },
      );
    }
  }

  return (
    <Tooltip content={tooltipTitle}>
      <InfoLabel>{source}</InfoLabel>
    </Tooltip>
  );
}

function VariableSourceLink({ variable }) {
  const { t } = useTranslation();
  let resourceName;
  let resourceLink;

  if (variable.valueFrom?.configMapKeyRef) {
    resourceName = variable.valueFrom.configMapKeyRef.name;
    resourceLink = `config-maps/details/${resourceName}`;
  }
  if (variable.valueFrom?.secretKeyRef) {
    resourceName = variable.valueFrom.secretKeyRef.name;
    resourceLink = `secrets/details/${resourceName}`;
  }

  return (
    <>
      {resourceLink ? (
        <Tooltip content={t('functions.variable.tooltip')}>
          <span
            className="link"
            onClick={() =>
              LuigiClient.linkManager()
                .fromContext('namespace')
                .navigate(resourceLink)
            }
          >
            {' '}
            {resourceName}{' '}
          </span>
        </Tooltip>
      ) : (
        '-'
      )}
    </>
  );
}

function VariableKey({ variable }) {
  return (
    variable.valueFrom?.configMapKeyRef?.key ||
    variable.valueFrom?.secretKeyRef?.key || (
      <span style={{ color: 'var(--sapNeutralTextColor,#6a6d70)' }}>N/A</span>
    )
  );
}

function VariableValue({ variable }) {
  const isBindingUsageVar = variable.type === VARIABLE_TYPE.BINDING_USAGE;
  const [show, setShow] = useState(false);
  const value = variable.valueFrom ? (
    <VariableSourceLink variable={variable} />
  ) : (
    <span>{variable.value || '-'}</span>
  );

  if (isBindingUsageVar) {
    const blurVariable = (
      <div
        className={!show ? 'blur-variable' : ''}
        onClick={_ => setShow(!show)}
      >
        {value}
      </div>
    );
    return (
      <div className="lambda-variable">
        <Tooltip
          content={
            show
              ? ENVIRONMENT_VARIABLES_PANEL.VARIABLE_TYPE.BINDING_USAGE
                  .HIDE_VALUE_MESSAGE
              : ENVIRONMENT_VARIABLES_PANEL.VARIABLE_TYPE.BINDING_USAGE
                  .SHOW_VALUE_MESSAGE
          }
        >
          {blurVariable}
        </Tooltip>
      </div>
    );
  }
  return value;
}

export default function LambdaEnvs({
  lambda,
  customVariables,
  customValueFromVariables,
  injectedVariables,
}) {
  const updateLambdaVariables = useUpdateLambda({
    lambda,
    type: UPDATE_TYPE.VARIABLES,
  });

  const { data: configmaps } = useGetList()(
    `/api/v1/namespaces/${lambda.metadata.namespace}/configmaps`,
  );
  const { data: secrets } = useGetList()(
    `/api/v1/namespaces/${lambda.metadata.namespace}/secrets`,
  );
  const rowRenderer = variable => [
    <span>{variable.name}</span>,
    <span className="sap-icon--arrow-right" />,
    <VariableValue variable={variable} />,
    <VariableSource variable={variable} />,
    <VariableKey variable={variable} />,
    <VariableStatus validation={variable.validation} />,
  ];

  const editEnvsModal = (
    <>
      <CreateVariable
        lambda={lambda}
        secrets={secrets}
        configmaps={configmaps}
        customVariables={customVariables}
        customValueFromVariables={customValueFromVariables}
      />
    </>
  );

  const entries = [
    ...validateVariables(customVariables, [], injectedVariables),
    ...customValueFromVariables,
  ];

  function prepareVariablesInput(newVariables) {
    return newVariables.map(variable => {
      if (variable.type === VARIABLE_TYPE.CUSTOM) {
        return {
          name: variable.name,
          value: variable.value,
        };
      }
      return {
        name: variable.name,
        valueFrom: variable.valueFrom,
      };
    });
  }

  function onDeleteVariables(variable) {
    let newVariables = entries.filter(
      oldVariable => oldVariable.id !== variable.id,
    );

    newVariables = validateVariables(newVariables, [], injectedVariables);
    const preparedVariable = prepareVariablesInput(newVariables);

    updateLambdaVariables({
      spec: {
        ...lambda.spec,
        env: [...preparedVariable],
      },
    });
  }

  const actions = [
    {
      name: 'Edit',
      component: variable => (
        <EditVariable
          lambda={lambda}
          secrets={secrets}
          configmaps={configmaps}
          customVariables={customVariables}
          customValueFromVariables={customValueFromVariables}
          variable={variable}
        />
      ),
    },
    {
      name: 'Delete',
      handler: variable => onDeleteVariables(variable),
    },
  ];

  return (
    <div className="lambda-variables">
      <GenericList
        title={ENVIRONMENT_VARIABLES_PANEL.LIST.TITLE}
        showSearchField={true}
        showSearchSuggestion={false}
        textSearchProperties={textSearchProperties}
        extraHeaderContent={editEnvsModal}
        actions={actions}
        entries={entries}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        notFoundMessage={
          ENVIRONMENT_VARIABLES_PANEL.LIST.ERRORS.RESOURCES_NOT_FOUND
        }
        noSearchResultMessage={
          ENVIRONMENT_VARIABLES_PANEL.LIST.ERRORS.NOT_MATCHING_SEARCH_QUERY
        }
      />
    </div>
  );
}
