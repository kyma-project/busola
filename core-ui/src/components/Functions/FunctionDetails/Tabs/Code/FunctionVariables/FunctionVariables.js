import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';

import { Icon, InfoLabel } from 'fundamental-react';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { GenericList } from 'shared/components/GenericList/GenericList';

import CreateVariable from './CreateVariable/CreateVariable';
import EditVariable from './EditVariable/EditVariable';

import {
  VARIABLE_VALIDATION,
  VARIABLE_TYPE,
  WARNINGS_VARIABLE_VALIDATION,
} from 'components/Functions/helpers/functionVariables';
import { useUpdateFunction, UPDATE_TYPE } from 'components/Functions/hooks';

import { validateVariables } from './validation';

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

  if (variable.valueFrom) {
    if (variable.valueFrom.configMapKeyRef) {
      source = t('functions.variable.type.config-map');
      tooltipTitle = formatMessage(t('functions.variable.tooltip.config-map'), {
        resourceName: variable.valueFrom.configMapKeyRef.name,
      });
    }
    if (variable.valueFrom.secretKeyRef) {
      source = t('functions.variable.type.secret');
      tooltipTitle = formatMessage(t('functions.variable.tooltip.secret'), {
        resourceName: variable.valueFrom.secretKeyRef.name,
      });
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

function VariableValue({ variable }) {
  const value = variable.valueFrom ? (
    <VariableSourceLink variable={variable} />
  ) : (
    <span>{variable.value || EMPTY_TEXT_PLACEHOLDER}</span>
  );

  return value;
}

export default function FunctionVariables({
  func,
  secrets,
  configmaps,
  customVariables,
  customValueFromVariables,
  injectedVariables,
}) {
  const { t, i18n } = useTranslation();

  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    i18n,
    resourceType: t('functions.variable.title.environment-variables'),
  });

  const [chosenVariable, setChosenVariable] = useState(null);

  const headerRenderer = () => [
    t('functions.variable.header.name'),
    '',
    t('functions.variable.header.value'),
    t('functions.variable.header.owner'),
    t('functions.variable.header.source'),
    t('functions.variable.header.key'),
    '',
  ];

  const updateFunctiontionVariables = useUpdateFunction({
    func,
    type: UPDATE_TYPE.VARIABLES,
  });

  const rowRenderer = variable => [
    <span>{variable.name}</span>,
    <span className="sap-icon--arrow-right" />,
    <VariableValue variable={variable} />,
    <ControlledBy ownerReferences={variable.owners} />,
    <VariableSource variable={variable} />,
    <VariableKey variable={variable} />,
    <VariableStatus validation={variable.validation} />,
  ];

  const addEnvModal = (
    <CreateVariable
      func={func}
      secrets={secrets}
      configmaps={configmaps}
      customVariables={customVariables}
      customValueFromVariables={customValueFromVariables}
      injectedVariables={injectedVariables}
    />
  );

  const entries = [
    ...validateVariables(customVariables, [], injectedVariables, []),
    ...validateVariables(customValueFromVariables, [], injectedVariables, []),
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

    newVariables = validateVariables(newVariables, [], injectedVariables, []);
    const preparedVariable = prepareVariablesInput(newVariables);

    updateFunctiontionVariables({
      spec: {
        ...func.spec,
        env: [...preparedVariable],
      },
    });
  }

  const actions = [
    {
      name: t('common.buttons.edit'),
      icon: 'edit',
      component: variable => (
        <EditVariable
          func={func}
          secrets={secrets}
          configmaps={configmaps}
          customVariables={customVariables}
          customValueFromVariables={customValueFromVariables}
          injectedVariables={injectedVariables}
          variable={variable}
        />
      ),
    },
    {
      name: t('common.buttons.delete'),
      icon: 'delete',
      handler: variable => {
        setChosenVariable(variable);
        handleResourceDelete({
          deleteFn: () => onDeleteVariables(variable),
        });
      },
    },
  ];

  return (
    <div className="function-variables">
      <GenericList
        title={t('functions.variable.title.environment-variables')}
        showSearchField={true}
        showSearchSuggestion={false}
        textSearchProperties={textSearchProperties}
        extraHeaderContent={addEnvModal}
        actions={actions}
        entries={entries}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        notFoundMessage={t('functions.variable.not-found')}
        noSearchResultMessage={t('functions.variable.not-match')}
        i18n={i18n}
      />
      <DeleteMessageBox
        resource={chosenVariable}
        resourceName={chosenVariable?.name}
        deleteFn={v => onDeleteVariables(v)}
      />
    </div>
  );
}
