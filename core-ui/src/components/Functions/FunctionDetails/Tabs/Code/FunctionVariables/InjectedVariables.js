import React from 'react';
import LuigiClient from '@luigi-project/client';

import { Icon, InfoLabel } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { GenericList } from 'shared/components/GenericList/GenericList';

import {
  VARIABLE_VALIDATION,
  VARIABLE_TYPE,
  WARNINGS_VARIABLE_VALIDATION,
} from 'components/Functions/helpers/functionVariables';

import './FunctionEnvs.scss';
import { formatMessage } from 'components/Functions/helpers/misc';
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
      message = t('functions.variable.warnings.sbu-can-be-overridden.by-both');
      break;
    }
    case VARIABLE_VALIDATION.CAN_OVERRIDE_BY_CUSTOM_ENV: {
      message = t(
        'functions.variable.warnings.sbu-can-be-overridden.by-custom-env',
      );
      break;
    }
    case VARIABLE_VALIDATION.CAN_OVERRIDE_BY_SBU: {
      message = t('functions.variable.warnings.sbu-can-be-overridden.by-sbu');
      break;
    }
    default: {
      message = t('functions.variable.warnings.variable-can-override-sbu');
    }
  }

  return <Tooltip content={message}>{control}</Tooltip>;
}

function VariableSource({ variable }) {
  const { t } = useTranslation();
  let source = t('functions.variable.type.custom');
  let tooltipTitle = t('functions.variable.tooltip.custom');

  if (variable.type === VARIABLE_TYPE.BINDING_USAGE) {
    source = t('functions.variable.type.service-binding');
    tooltipTitle = formatMessage(
      t('functions.variable.tooltip.service-binding'),
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
        <Tooltip content={t('functions.variable.tooltip.text')}>
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
  func,
  customVariables,
  customValueFromVariables,
  injectedVariables,
}) {
  const { t, i18n } = useTranslation();

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
    <div className="func-variables">
      <GenericList
        title={t('functions.variable.title.injected-variables')}
        showSearchField={true}
        showSearchSuggestion={false}
        textSearchProperties={textSearchProperties}
        entries={entries}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        notFoundMessage={t('functions.variable.not-found')}
        noSearchResultMessage={t('functions.variable.not-match')}
        i18n={i18n}
      />
    </div>
  );
}
