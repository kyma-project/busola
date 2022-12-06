import React from 'react';
import { Token } from 'fundamental-react';
import { Trans, useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import './components.scss';
import { HelpEntries } from '../types';

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
      <button className="button-link" onClick={() => setQuery(suggestedQuery)}>
        {suggestedQuery}
      </button>
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
        // buttonLabel={t('command-palette.search.remove-ns-context')} todo
        className="y-fd-token y-fd-token--no-button y-fd-token--gap fd-margin-end--tiny fd-margin-begin--tiny"
        onClick={() => setNamespaceContext(null)}
      >
        {namespaceContext}
      </Token>
    </div>
  );
}

export function ShortHelpText({ showFullHelp }: { showFullHelp: () => void }) {
  const { t } = useTranslation();

  return (
    <p className="short-help help-text">
      {t('command-palette.help.short-help')}
      <button className="button-link" onClick={showFullHelp}>
        {t('command-palette.item-actions.show-help')}
      </button>
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
      <h1 className="help-header">{t('command-palette.help.navigation')}</h1>
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
      <h1 className="help-header">
        {t('command-palette.help.resource-aliases')}
      </h1>
      <table className="help-text">
        <tbody>
          {helpEntries.navigation.map(({ name, aliases }) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{aliases?.join(', ') || EMPTY_TEXT_PLACEHOLDER}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {helpEntries.crds.length ? (
        <>
          <h1 className="help-header">
            {t('command-palette.help.crd-aliases')}
          </h1>
          <table className="help-text">
            <tbody>
              {helpEntries.crds.map(({ name, shortNames }) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{shortNames?.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </div>
  );
}
