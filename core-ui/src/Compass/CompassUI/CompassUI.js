import React, { useEffect, useRef, useState } from 'react';
import { useMicrofrontendContext } from 'react-shared';
import { NamespaceContextDisplay, SuggestedSearch } from './components';
import './CompassUI.scss';
import { ResultsList } from './ResultsList/ResultsList';
import { addHistoryEntry, getHistoryEntries } from './search-history';
import { LOADING_INDICATOR, useSearchResults } from './useSearchResults';
import { DebouncedFormInput } from '../../shared/components/DebouncedFormInput';

function CompassUIBackground({ hide, children }) {
  const onBackgroundClick = e => {
    if (e.nativeEvent.srcElement.id === 'background') {
      hide();
    }
  };

  return (
    <div id="background" className="compass-ui" onClick={onBackgroundClick}>
      {children}
    </div>
  );
}

export function CompassUI({ hide }) {
  const { namespaceId: namespace } = useMicrofrontendContext();
  const [search, setSearch] = useState('');
  const [namespaceContext, setNamespaceContext] = useState(namespace);
  const inputRef = useRef();
  const [activeIndex, setActiveIndex] = useState(0);
  const [originalQuery, setOriginalQuery] = useState('');
  const [isHistoryMode, setHistoryMode] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);

  const { results, suggestedSearch, autocompletePhrase } = useSearchResults({
    search,
    namespaceContext,
  });

  useEffect(() => setNamespaceContext(namespace), [namespace]);

  const keyDownInHistoryMode = e => {
    const historyEntries = getHistoryEntries();
    if (e.key === 'Enter' && results[0]) {
      // choose current entry
      addHistoryEntry(results[0].query);
      results[0].onActivate();
    } else if (e.key === 'Tab') {
      // fill search with active history entry
      setSearch(historyEntries[historyIndex]);
      setActiveIndex(0);
      setHistoryMode(false);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      // try going up in history
      const entry = historyEntries[historyIndex + 1];
      if (entry) {
        setHistoryIndex(historyIndex + 1);
        setSearch(entry);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIndex === 0) {
        // deactivate history mode
        setSearch(originalQuery);
        setHistoryMode(false);
      } else {
        //try going down in history
        const entry = historyEntries[historyIndex - 1];
        if (entry) {
          setHistoryIndex(historyIndex - 1);
          setSearch(entry);
        }
      }
    } else {
      // deactivate history mode, but keep the search
      setHistoryMode(false);
      setActiveIndex(0);
    }
  };

  const keyDownInDropdownMode = e => {
    if (e.key === 'Tab') {
      if (autocompletePhrase) {
        setSearch(autocompletePhrase);
      } else if (suggestedSearch) {
        setSearch(suggestedSearch);
      } else if (
        results?.[activeIndex] &&
        results[activeIndex] !== LOADING_INDICATOR
      ) {
        // fill search with active result
        setSearch(results[activeIndex].query || '');
      }
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      const historyEntries = getHistoryEntries();
      if (activeIndex === 0 && historyEntries.length) {
        // activate history mode
        setOriginalQuery(search);
        setSearch(historyEntries[historyIndex]);
        setHistoryMode(true);
        setHistoryIndex(0);
      }
      e.preventDefault();
    }
  };

  return (
    <CompassUIBackground hide={hide}>
      <div className="compass-ui__wrapper" role="dialog">
        <div className="compass-ui__content">
          <NamespaceContextDisplay
            namespaceContext={namespaceContext}
            setNamespaceContext={setNamespaceContext}
          />
          <DebouncedFormInput
            value={!isHistoryMode ? search : ''}
            placeholder={
              !isHistoryMode ? 'Type to search, e.g. "ns default"' : search
            }
            onChange={setSearch}
            onKeyDown={e => {
              if (isHistoryMode) {
                keyDownInHistoryMode(e);
              } else {
                keyDownInDropdownMode(e);
              }
            }}
            autoFocus
            ref={inputRef}
          />
          {search && (
            <ResultsList
              results={results}
              hide={hide}
              isHistoryMode={isHistoryMode}
              suggestion={
                <SuggestedSearch
                  suggestedSearch={suggestedSearch}
                  setSearch={search => {
                    setSearch(search);
                    inputRef.current.focus();
                  }}
                />
              }
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
          )}
        </div>
      </div>
    </CompassUIBackground>
  );
}
