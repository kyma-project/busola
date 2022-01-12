import React, { useEffect, useRef, useState } from 'react';
import { useMicrofrontendContext } from 'react-shared';
import { NamespaceContextDisplay, SuggestedQuery } from './components';
import { ResultsList } from './ResultsList/ResultsList';
import { addHistoryEntry, getHistoryEntries } from './search-history';
import { LOADING_INDICATOR, useSearchResults } from './useSearchResults';
import './CompassUI.scss';
import { FormInput } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

function CompassUIBackground({ hide, children }) {
  const onBackgroundClick = e => {
    if (e.nativeEvent.srcElement.id === 'compass-background') {
      hide();
    }
  };

  return (
    <div
      id="compass-background"
      className="compass-ui"
      onClick={onBackgroundClick}
    >
      {children}
    </div>
  );
}

export function CompassUI({ hide, resourceCache, updateResourceCache }) {
  const { namespaceId: namespace } = useMicrofrontendContext();
  const { t } = useTranslation();

  const [query, setQuery] = useState('');
  const [originalQuery, setOriginalQuery] = useState('');
  const [namespaceContext, setNamespaceContext] = useState(namespace);

  const inputRef = useRef();

  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [isHistoryMode, setHistoryMode] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);

  const { results, suggestedQuery, autocompletePhrase } = useSearchResults({
    query,
    namespaceContext,
    resourceCache,
    updateResourceCache,
  });

  useEffect(() => setNamespaceContext(namespace), [namespace]);

  const keyDownInHistoryMode = e => {
    const historyEntries = getHistoryEntries();
    if (e.key === 'Enter' && results[0]) {
      // choose current entry
      addHistoryEntry(results[0].query);
      results[0].onActivate();
      hide();
    } else if (e.key === 'Tab') {
      // fill search with active history entry
      setQuery(historyEntries[historyIndex]);
      setActiveResultIndex(0);
      setHistoryMode(false);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      // try going up in history
      const entry = historyEntries[historyIndex + 1];
      if (entry) {
        setHistoryIndex(historyIndex + 1);
        setQuery(entry);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIndex === 0) {
        // deactivate history mode
        setQuery(originalQuery);
        setHistoryMode(false);
      } else {
        //try going down in history
        const entry = historyEntries[historyIndex - 1];
        if (entry) {
          setHistoryIndex(historyIndex - 1);
          setQuery(entry);
        }
      }
    } else {
      // deactivate history mode, but keep the search
      setHistoryMode(false);
      setActiveResultIndex(0);
    }
  };

  const keyDownInDropdownMode = e => {
    if (e.key === 'Tab') {
      if (autocompletePhrase) {
        setQuery(autocompletePhrase);
      } else if (suggestedQuery) {
        setQuery(suggestedQuery);
      } else if (
        results?.[activeResultIndex] &&
        results[activeResultIndex] !== LOADING_INDICATOR
      ) {
        // fill search with active result
        setQuery(results[activeResultIndex].query || '');
      }
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      const historyEntries = getHistoryEntries();
      if (activeResultIndex === 0 && historyEntries.length) {
        // activate history mode
        setOriginalQuery(query);
        setQuery(historyEntries[historyIndex]);
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
          <FormInput
            value={!isHistoryMode ? query : ''}
            placeholder={
              !isHistoryMode ? t('compass.search.placeholder') : query
            }
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (isHistoryMode) {
                keyDownInHistoryMode(e);
              } else {
                keyDownInDropdownMode(e);
              }
            }}
            autoFocus
            className="search-input"
            type="search"
            ref={inputRef}
          />
          {query && (
            <ResultsList
              results={results}
              hideCompass={hide}
              isHistoryMode={isHistoryMode}
              suggestion={
                <SuggestedQuery
                  suggestedQuery={suggestedQuery}
                  setQuery={query => {
                    setQuery(query);
                    inputRef.current.focus();
                  }}
                />
              }
              activeIndex={activeResultIndex}
              setActiveIndex={setActiveResultIndex}
            />
          )}
        </div>
      </div>
    </CompassUIBackground>
  );
}
