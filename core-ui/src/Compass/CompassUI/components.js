import React from 'react';
import { Token } from 'fundamental-react';

export function SuggestedSearch({ suggestedQuery, setQuery }) {
  if (!suggestedQuery) {
    return null;
  }

  return (
    <>
      Did you mean:{' '}
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
  if (!namespaceContext) {
    return null;
  }

  return (
    <div style={{ maxWidth: 'fit-content' }}>
      <Token
        buttonLabel=""
        className="y-fd-token y-fd-token--no-button y-fd-token--gap fd-margin-end--tiny"
        onClick={() => setNamespaceContext(null)}
      >
        {namespaceContext}
      </Token>
    </div>
  );
}
