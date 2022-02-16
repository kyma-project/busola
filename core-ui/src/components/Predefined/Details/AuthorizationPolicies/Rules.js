import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

import { GenericList } from 'react-shared';
import { Tokens } from 'shared/components/Tokens';
const From = ({ from }) => {
  const { t } = useTranslation();
  return (
    <LayoutPanel>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('authorizationpolicies.headers.from')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {from.map(cos => {
          return Object.entries(cos.source).map(([key, value]) => (
            <LayoutPanel>
              <LayoutPanel.Header>
                <LayoutPanel.Head
                  title={t('authorizationpolicies.headers.source')}
                />
              </LayoutPanel.Header>
              <LayoutPanel.Body>
                <LayoutPanelRow name={key} value={<Tokens tokens={value} />} />
              </LayoutPanel.Body>
            </LayoutPanel>
          ));
        })}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

const To = ({ to }) => {
  const { t } = useTranslation();
  return (
    <LayoutPanel>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('authorizationpolicies.headers.to')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {to.map(cos => {
          return Object.entries(cos.operation).map(([key, value]) => (
            <LayoutPanel>
              <LayoutPanel.Header>
                <LayoutPanel.Head
                  title={t('authorizationpolicies.headers.operation')}
                />
              </LayoutPanel.Header>
              <LayoutPanel.Body>
                <LayoutPanelRow name={key} value={<Tokens tokens={value} />} />
              </LayoutPanel.Body>
            </LayoutPanel>
          ));
        })}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};
const When = ({ when }) => {
  const { t, i18n } = useTranslation();

  const headerRenderer = () => [
    t('authorizationpolicies.headers.key'),
    t('authorizationpolicies.headers.values'),
    t('authorizationpolicies.headers.not-values'),
  ];

  const rowRenderer = entry => [
    entry.key,
    <Tokens tokens={entry.values} />,
    <Tokens tokens={entry.notValues} />,
  ];

  return (
    <GenericList
      title={t('authorizationpolicies.headers.when')}
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
        <LayoutPanel.Head title={t('authorizationpolicies.headers.rules')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <div>
          {policy.spec.rules?.map((rule, index) => (
            <LayoutPanel>
              <LayoutPanel.Header>
                <LayoutPanel.Head
                  title={t('authorizationpolicies.headers.rule', {
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
