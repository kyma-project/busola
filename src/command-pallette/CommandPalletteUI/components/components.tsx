import React from 'react';
import { Button, Icon, Title, Token } from '@ui5/webcomponents-react';
import { Trans, useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { HelpEntries } from '../types';

import { spacing } from '@ui5/webcomponents-react-base';
import './components.scss';

export function SuggestedQuery({
  suggestedQuery,
  setQuery,
}: {
  suggestedQuery: string;
  setQuery: (query: string) => void;
}) {
  const { t } = useTranslation();

  if (!suggestedQuery) {
    return null;
  }

  return (
    <>
      {t('command-palette.results.did-you-mean')}
      <Button className="button-link" onClick={() => setQuery(suggestedQuery)}>
        {suggestedQuery}
      </Button>
    </>
  );
}

export function NamespaceContextDisplay({
  namespaceContext,
  setNamespaceContext,
}: {
  namespaceContext: string | null;
  setNamespaceContext: (namespace: string | null) => void;
}) {
  const { t } = useTranslation();

  if (!namespaceContext) {
    return null;
  }

  return (
    <div className="namespace-context">
      <span className="namespace-name">{t('namespaces.name_singular')}:</span>
      <Token
        style={spacing.sapUiTinyMarginBeginEnd}
        text={namespaceContext}
        closeIcon={
          <Icon
            name="decline"
            onClick={() => setNamespaceContext(null)}
            accessibleName={t('command-palette.search.remove-ns-context')}
          />
        }
      />
    </div>
  );
}

export function ShortHelpText() {
  return (
    <p className="short-help help-text">
      <Trans i18nKey="command-palette.help.short-help">
        <pre className="key"></pre>
      </Trans>
    </p>
  );
}

export function CommandPalletteHelp({
  helpEntries,
}: {
  helpEntries: HelpEntries;
}) {
  const { t } = useTranslation();

  return (
    <div className="help">
      <div className="help-text">
        <Trans i18nKey="command-palette.help.full">
          <pre className="key"></pre>
        </Trans>
      </div>
      <Title level="H5" className="help-header">
        {t('command-palette.help.navigation')}
      </Title>
      <br className="help-divider" />
      <table className="help-text">
        <thead>
          <tr>
            <th>{t('common.headers.name')}</th>
            <th>{t('common.headers.description')}</th>
          </tr>
        </thead>
        <tbody>
          {helpEntries.others.map(({ name, alias, description }) => (
            <tr key={name}>
              <td>
                {name}, {alias || EMPTY_TEXT_PLACEHOLDER}
              </td>
              <td>{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Title level="H5" className="help-header">
        {t('command-palette.help.resource-aliases')}
      </Title>
      <br className="help-divider" />
      <div className="help-text">
        {helpEntries.navigation.map(({ name, aliases }) => (
          <div key={name}>
            <p className="help-text__name">{name}</p>
            <pre className="key">
              {aliases?.join(', ') || EMPTY_TEXT_PLACEHOLDER}
            </pre>
          </div>
        ))}
      </div>
      {helpEntries.crds.length ? (
        <>
          <Title level="H5" className="help-header">
            {t('command-palette.help.crd-aliases')}
          </Title>
          <br className="help-divider" />
          <div className="help-text">
            {helpEntries.crds.map(({ name, shortNames }) => (
              <div key={name}>
                <p className="help-text__name">{name}</p>
                <pre className="key">{shortNames?.join(', ')}</pre>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
