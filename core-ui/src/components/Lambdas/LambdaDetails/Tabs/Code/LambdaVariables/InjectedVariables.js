import React from 'react';
import LuigiClient from '@luigi-project/client';

import { Icon, InfoLabel } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER, GenericList, Tooltip } from 'react-shared';

import {
  VARIABLE_VALIDATION,
  VARIABLE_TYPE,
  WARNINGS_VARIABLE_VALIDATION,
} from 'components/Lambdas/helpers/lambdaVariables';
import { ENVIRONMENT_VARIABLES_PANEL } from 'components/Lambdas/constants';

import './LambdaEnvs.scss';
import { formatMessage } from 'components/Lambdas/helpers/misc';
import { useTranslation } from 'react-i18next';

const textSearchProperties = ['name', 'value', 'type'];

function VariableStatus({ validation }) {
  const { t } = useTranslation();
  if (!WARNINGS_VARIABLE_VALIDATION.includes(validation)) {
    return null;
  }

  const statusClassName = 'fd-has-color-status-2';
  const control = (
    <div>
      <span className={statusClassName}>
        {t('functions.variable.warnings.text')}
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
      message = t('functions.variable.warnings.variable-can-override-sbu');
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
      message = t('functions.variable.warnings.variable-can-override-sbu');
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
            {` ${resourceName} `}
          </span>
        </Tooltip>
      ) : (
        EMPTY_TEXT_PLACEHOLDER
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

export default function InjectedVariables({
  lambda,
  customVariables,
  customValueFromVariables,
  injectedVariables,
}) {
  const { t } = useTranslation();

  const headerRenderer = () => [
    t('functions.variable.header.name'),
    '',
    t('functions.variable.header.value'),
    t('functions.variable.header.source'),
    t('functions.variable.header.key'),
    '',
  ];

  const rowRenderer = variable => [
    <span>{variable.name}</span>,
    <span className="sap-icon--arrow-right" />,
    <VariableSourceLink variable={variable} />,
    <VariableSource variable={variable} />,
    <VariableKey variable={variable} />,
    <VariableStatus validation={variable.validation} />,
  ];

  const entries = [...injectedVariables];

  return (
    <div className="lambda-variables">
      <GenericList
        title={t('functions.variable.titleinjected-variables')}
        showSearchField={true}
        showSearchSuggestion={false}
        textSearchProperties={textSearchProperties}
        entries={entries}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        notFoundMessage={t('functions.variable.not-found')}
        noSearchResultMessage={t('functions.variable.not-match')}
      />
    </div>
  );
}
