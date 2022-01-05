import React from 'react';
import { useEventListener } from 'hooks/useEventListener';

export function SuggestedSearch({ search, suggestedSearch, setSearch }) {
  const isSuggestionValid = !!suggestedSearch && suggestedSearch !== search;

  const onKeyDown = ({ key, shiftKey }) => {
    if (key === 'Enter' && shiftKey && isSuggestionValid) {
      setSearch(suggestedSearch);
    }
  };

  useEventListener('keydown', onKeyDown, [isSuggestionValid]);

  if (!isSuggestionValid) {
    return null;
  }

  //enter to choose
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
