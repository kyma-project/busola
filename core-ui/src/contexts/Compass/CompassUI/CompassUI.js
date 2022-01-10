import React, { useEffect, useRef, useState } from 'react';
import { useMicrofrontendContext } from 'react-shared';
import { NamespaceContextDisplay, SuggestedSearch } from './components';
import './CompassUI.scss';
import { ResultsList } from './ResultsList/ResultsList';
import { addHistoryEntry, getHistoryEntries } from './search-history';
import { useSearchResults } from './useSearchResults';
import { DebouncedFormInput } from '../../../shared/components/DebouncedFormInput';

export function CompassUIBackground(props) {
  const onBackgroundClick = e => {
    if (e.nativeEvent.srcElement.id === 'background') {
      props.hide();
    }
  };

  return (
    <div id="background" className="compass-ui" onClick={onBackgroundClick}>
      <CompassUI {...props} />
    </div>
  );
}

function CompassUI({ hide }) {
  const { namespaceId: namespace } = useMicrofrontendContext();
  const [searchString, setSearchString] = useState('');
  const [namespaceContext, setNamespaceContext] = useState(namespace);
  const inputRef = useRef();
  const [activeIndex, setActiveIndex] = useState(0);
  const [originalQuery, setOriginalQuery] = useState('');
  const [isHistoryMode, setHistoryMode] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);

  const { results, suggestedSearch } = useSearchResults({
    searchString,
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
      setSearchString(historyEntries[historyIndex]);
      setActiveIndex(0);
      setHistoryMode(false);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      // try going up in history
      const entry = historyEntries[historyIndex + 1];
      if (entry) {
        setHistoryIndex(historyIndex + 1);
        setSearchString(entry);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIndex === 0) {
        // deactivate history mode
        setSearchString(originalQuery);
        setHistoryMode(false);
      } else {
        //try going down in history
        const entry = historyEntries[historyIndex - 1];
        if (entry) {
          setHistoryIndex(historyIndex - 1);
          setSearchString(entry);
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
      if (results?.[activeIndex]) {
        // fill search with active result
        setSearchString(results[activeIndex].query || '');
      } else if (suggestedSearch) {
        // choose suggested search
        setSearchString(suggestedSearch);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      const historyEntries = getHistoryEntries();
      if (activeIndex === 0 && historyEntries.length) {
        // activate history mode
        setOriginalQuery(searchString);
        setSearchString(historyEntries[historyIndex]);
        setHistoryMode(true);
        setHistoryIndex(0);
      }
      e.preventDefault();
    }
  };

  return (
    <div className="compass-ui__wrapper" role="dialog">
      <div className="compass-ui__content">
        <NamespaceContextDisplay
          namespaceContext={namespaceContext}
          setNamespaceContext={setNamespaceContext}
        />
        <DebouncedFormInput
          value={!isHistoryMode ? searchString : ''}
          placeholder={
            !isHistoryMode ? 'Type to search, e.g. "ns default"' : searchString
          }
          onChange={setSearchString}
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
        {searchString && (
          <ResultsList
            results={results}
            hide={hide}
            isHistoryMode={isHistoryMode}
            suggestion={
              <SuggestedSearch
                search={searchString}
                suggestedSearch={suggestedSearch}
                setSearch={search => {
                  setSearchString(search);
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
  );
}
