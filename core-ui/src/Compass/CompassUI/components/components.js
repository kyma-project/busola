import React from 'react';
import { Token } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import './components.scss';

export function SuggestedQuery({ suggestedQuery, setQuery }) {
  const { t } = useTranslation();

  if (!suggestedQuery) {
    return null;
  }

  return (
    <>
      {t('compass.results.did-you-mean')}
      <button className="button-link" onClick={() => setQuery(suggestedQuery)}>
        {suggestedQuery}
      </button>
    </>
  );
}

export function NamespaceContextDisplay({
  namespaceContext,
  setNamespaceContext,
}) {
  const { t } = useTranslation();

  if (!namespaceContext) {
    return null;
  }

  return (
    <div className="namespace-context">
      <span className="namespace-name">{t('namespaces.name_singular')}:</span>
      <Token
        buttonLabel={t('compass.search.remove-ns-context')}
        className="y-fd-token y-fd-token--no-button y-fd-token--gap fd-margin-end--tiny fd-margin-begin--tiny"
        onClick={() => setNamespaceContext(null)}
      >
        {namespaceContext}
      </Token>
    </div>
  );
}

export function ShortHelpText({ showFullHelp }) {
  const { t } = useTranslation();

  return (
    <p className="short-help help-text">
      {t('compass.help.short-help')}
      <button className="button-link" onClick={showFullHelp}>
        {t('compass.item-actions.show-help')}
      </button>
    </p>
  );
}

export function CompassHelp({ helpEntries }) {
  const Key = ({ children }) => <pre className="key">{children}</pre>;

  return (
    <div className="help">
      <div className="help-text">
        Use <Key>↑</Key> and <Key>↓</Key>
        to navigate between results, <Key>⏎</Key>to choose, <Key>Tab</Key> to
        autocomplete.
      </div>
      <h1 className="help-header">Navigation</h1>
      <table className="help-text">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {helpEntries.others.map(([name, shortName, description]) => (
            <tr key={name}>
              <td>
                {name}, {shortName || EMPTY_TEXT_PLACEHOLDER}
              </td>
              <td>{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h1 className="help-header">Resource Aliases</h1>
      <table className="help-text">
        <tbody>
          {helpEntries.navigation.map(([name, shortName]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{shortName || EMPTY_TEXT_PLACEHOLDER}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
