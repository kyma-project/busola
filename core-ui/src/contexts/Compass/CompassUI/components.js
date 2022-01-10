import React from 'react';
import { useEventListener } from 'hooks/useEventListener';

export function SuggestedSearch({ search, suggestedSearch, setSearch }) {
  const isSuggestionValid = !!suggestedSearch && suggestedSearch !== search;

  const onKeyDown = ({ key }) => {
    if (!isSuggestionValid) return;

    if (key === 'Tab') {
      setSearch(suggestedSearch);
    }
  };

  useEventListener('keydown', onKeyDown, [isSuggestionValid]);

  if (!isSuggestionValid) {
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
