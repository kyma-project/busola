import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';

import { InfoLabel } from 'fundamental-react';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { GenericList } from 'shared/components/GenericList/GenericList';

import CreateVariable from './CreateVariable/CreateVariable';
import EditVariable from './EditVariable/EditVariable';

import { VARIABLE_TYPE } from 'components/Functions/helpers/functionVariables';
import { useUpdateFunction, UPDATE_TYPE } from 'components/Functions/hooks';

import { validateVariables } from './validation';

import { formatMessage } from 'components/Functions/helpers/misc';
import { useTranslation } from 'react-i18next';
import './FunctionEnvs.scss';

const textSearchProperties = ['name', 'value', 'type'];

function VariableSource({ variable }) {
  const { t } = useTranslation();

  let source = t('functions.variable.type.custom');
  let tooltipTitle = t('functions.variable.tooltip.custom');

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
  ];

  const addEnvModal = (
    <CreateVariable
      func={func}
      secrets={secrets}
      configmaps={configmaps}
      customVariables={customVariables}
      customValueFromVariables={customValueFromVariables}
    />
  );

  const entries = [
    ...validateVariables(customVariables),
    ...validateVariables(customValueFromVariables),
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

    newVariables = validateVariables(newVariables);
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
        extraHeaderContent={addEnvModal}
        actions={actions}
        entries={entries}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        i18n={i18n}
        messages={{
          notFoundMessage: t('functions.variable.not-found'),
        }}
        searchSettings={{
          showSearchField: true,
          showSearchSuggestion: false,
          textSearchProperties,
          noSearchResultMessage: t('functions.variable.not-match'),
        }}
      />
      <DeleteMessageBox
        resource={chosenVariable}
        resourceName={chosenVariable?.name}
        deleteFn={v => onDeleteVariables(v)}
      />
    </div>
  );
}
