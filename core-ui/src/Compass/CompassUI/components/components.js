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

export function CompassHelp({ helpEntries }) {
  console.log(helpEntries);
  return (
    <div style={{ opacity: '0.8', color: 'var(--sapNeutralColor)' }}>
      <h1>Navigation</h1>
      <table style={{ width: '100%' }}>
        <tbody>
          {helpEntries.navigation.map(([name, shortName]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{shortName || EMPTY_TEXT_PLACEHOLDER}</td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
      <h1>Other</h1>
      <table style={{ width: '100%' }}>
        <tbody>
          {helpEntries.others.map(([name, shortName, description]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{shortName || EMPTY_TEXT_PLACEHOLDER}</td>
              <td>{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
