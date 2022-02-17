import React from 'react';
import { useTranslation } from 'react-i18next';

import { Link, LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { GenericList } from 'react-shared';
import { Tokens } from 'shared/components/Tokens';
import { navigateToResource } from 'shared/helpers/universalLinks';

const From = ({ from }) => {
  const { t } = useTranslation();
  return (
    <LayoutPanel>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('authorization-policies.headers.from')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {from.map(fromSource => {
          return Object.entries(fromSource.source).map(([key, value]) => (
            <Source name={key} value={value} key={key} />
          ));
        })}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

const Source = ({ name, value }) => {
  const { t } = useTranslation();

  return (
    <LayoutPanel>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('authorization-policies.headers.source')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow
          name={name}
          value={
            name !== 'principals' ? (
              <Tokens tokens={value} />
            ) : (
              <Principals principals={value} />
            )
          }
          key={name}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

const Principals = ({ principals }) => {
  return (
    <ul>
      {principals.map(principal => {
        const nsIndex = principal.lastIndexOf('ns/') + 3;
        const saIndex = principal.lastIndexOf('/sa');
        const namespace = principal.substring(nsIndex, saIndex);
        const saName = principal.substr(saIndex + 4);

        return (
          <li key={saName}>
            <Link
              onClick={() =>
                navigateToResource({
                  namespace,
                  name: saName,
                  kind: 'ServiceAccount',
                })
              }
              key={saName}
            >
              {principal}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

const To = ({ to }) => {
  const { t } = useTranslation();

  return (
    <LayoutPanel>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('authorization-policies.headers.to')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {to.map(toOperator => {
          return Object.entries(toOperator.operation).map(([key, value]) => (
            <Operation name={key} value={value} key={key} />
          ));
        })}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

const Operation = ({ name, value }) => {
  const { t } = useTranslation();

  return (
    <LayoutPanel>
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('authorization-policies.headers.operation')}
        />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow name={name} value={<Tokens tokens={value} />} />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

const When = ({ when }) => {
  const { t, i18n } = useTranslation();

  const headerRenderer = () => [
    t('authorization-policies.headers.key'),
    t('authorization-policies.headers.values'),
    t('authorization-policies.headers.not-values'),
  ];

  const rowRenderer = entry => [
    entry.key,
    <Tokens tokens={entry.values} />,
    <Tokens tokens={entry.notValues} />,
  ];

  return (
    <GenericList
      title={t('authorization-policies.headers.when')}
      entries={when || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      i18n={i18n}
    />
  );
};

export const Rules = policy => {
  const { t } = useTranslation();

  if (!policy.spec.rules) return null;

  return (
    <LayoutPanel className="fd-margin--md" key={'ap-rules'}>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('authorization-policies.headers.rules')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <div>
          {policy.spec.rules?.map((rule, index) => (
            <LayoutPanel key={index}>
              <LayoutPanel.Header>
                <LayoutPanel.Head
                  title={t('authorization-policies.headers.rule', {
                    ruleNumber: index + 1,
                  })}
                />
              </LayoutPanel.Header>
              <LayoutPanel.Body>
                {rule.from && <From from={rule.from} />}
                <br />
                {rule.to && <To to={rule.to} />}
                <br />
                {rule.when && <When when={rule.when} />}
              </LayoutPanel.Body>
            </LayoutPanel>
          ))}
        </div>
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};
