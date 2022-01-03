import React, { useCallback } from 'react';
import { Link } from 'fundamental-react';
import { useEventListener } from 'hooks/useEventListener';

export function Result({ label, onClick, category }) {
  if (onClick) {
    return (
      <Link className="fd-link" onClick={onClick}>
        {category ? category + ' > ' : ''}
        {label}
      </Link>
    );
  }
  return label;
}

export function SuggestedSearch({ search, suggestedSearch, setSearch }) {
  const isSuggestionValid = !!suggestedSearch && suggestedSearch !== search;

  const onKeyDown = ({ key, shiftKey }) => {
    if (key === 'Enter' && shiftKey && isSuggestionValid) {
      setSearch(suggestedSearch);
    }
  };

  useEventListener('keydown', useCallback(onKeyDown, [isSuggestionValid]), [
    isSuggestionValid,
  ]);

  if (!isSuggestionValid) {
    return null;
  }

  //enter to choose
  return (
    <>
      Did you mean:
      <button onClick={() => setSearch(suggestedSearch)}>
        {suggestedSearch}
      </button>
    </>
  );
}
