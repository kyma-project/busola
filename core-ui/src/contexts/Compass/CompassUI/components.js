import React from 'react';
import { useEventListener } from 'hooks/useEventListener';
import { Token } from 'fundamental-react';

export function SuggestedSearch({ suggestedSearch, setSearch }) {
  if (!suggestedSearch) {
    return null;
  }

  return (
    <>
      Did you mean:{' '}
      <button
        className="button-link"
        onClick={() => setSearch(suggestedSearch)}
      >
        {suggestedSearch}
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
