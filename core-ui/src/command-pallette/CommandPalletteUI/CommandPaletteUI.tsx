import { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react';
import {
  CommandPalletteHelp,
  NamespaceContextDisplay,
  ShortHelpText,
  SuggestedQuery,
} from './components/components';
import { ResultsList } from './ResultsList/ResultsList';
import { addHistoryEntry, getHistoryEntries } from './search-history';
import { /*LOADING_INDICATOR,*/ useSearchResults } from './useSearchResults';
import './CommandPaletteUI.scss';
import { FormInput } from 'fundamental-react';
import { K8sResource } from 'types';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

function Background({
  hide,
  children,
}: {
  hide: () => void;
  children: ReactNode;
}) {
  return (
    <div
      id="command-palette-background"
      className="command-palette-ui"
      onClick={e => {
        if ((e.target as HTMLElement).id === 'command-palette-background') {
          hide();
        }
      }}
    >
      {children}
    </div>
  );
}

type CommandPaletteProps = {
  hide: () => void;
  resourceCache: Record<string, K8sResource[]>;
  updateResourceCache: (key: string, resources: K8sResource[]) => void;
};

export function CommandPaletteUI({
  hide,
  resourceCache,
  updateResourceCache,
}: CommandPaletteProps) {
  const namespace = useRecoilValue(activeNamespaceIdState);

  const [query, setQuery] = useState('');
  const [originalQuery, setOriginalQuery] = useState('');
  const [namespaceContext, setNamespaceContext] = useState<string | null>(
    namespace,
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [isHistoryMode, setHistoryMode] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);

  const {
    results,
    suggestedQuery,
    autocompletePhrase,
    helpEntries,
  } = useSearchResults({
    query,
    namespaceContext,
    hideCommandPalette: hide,
    resourceCache,
    updateResourceCache,
  });

  useEffect(() => setNamespaceContext(namespace), [namespace]);

  const keyDownInHistoryMode = (e: KeyboardEvent) => {
    const historyEntries = getHistoryEntries();
    if (e.key === 'Enter' && results[0]) {
      // choose current entry
      addHistoryEntry(results[0].query);
      results[0].onActivate();
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

  const keyDownInDropdownMode = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (autocompletePhrase) {
        setQuery(autocompletePhrase);
      } else if (suggestedQuery) {
        setQuery(suggestedQuery);
      } else if (
        results?.[activeResultIndex] // && todo
        // results[activeResultIndex] !== LOADING_INDICATOR
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

  const showHelp = query === '?' || query === 'help';

  return (
    <Background hide={hide}>
      <div className="command-palette-ui__wrapper" role="dialog">
        <div className="command-palette-ui__content">
          <NamespaceContextDisplay
            namespaceContext={namespaceContext}
            setNamespaceContext={setNamespaceContext}
          />
          <FormInput
            aria-label="command-palette-search"
            value={!isHistoryMode ? query : ''}
            placeholder={!isHistoryMode ? '' : query}
            onChange={(e: ChangeEvent) =>
              setQuery((e.target as HTMLInputElement).value)
            }
            onKeyDown={(e: KeyboardEvent) => {
              if (isHistoryMode) {
                keyDownInHistoryMode(e);
              } else {
                keyDownInDropdownMode(e);
              }
            }}
            autoFocus
            className="search-with-magnifying-glass"
            type="search"
            ref={inputRef}
          />
          {!showHelp && !query && (
            <ShortHelpText
              showFullHelp={() => {
                setQuery('help');
                inputRef.current?.focus();
              }}
            />
          )}
          {!showHelp && query && (
            <ResultsList
              results={results}
              isHistoryMode={isHistoryMode}
              suggestion={
                <SuggestedQuery
                  suggestedQuery={suggestedQuery}
                  setQuery={(query: string) => {
                    setQuery(query);
                    inputRef.current?.focus();
                  }}
                />
              }
              activeIndex={activeResultIndex}
              setActiveIndex={setActiveResultIndex}
            />
          )}
          {showHelp && <CommandPalletteHelp helpEntries={helpEntries} />}
        </div>
      </div>
    </Background>
  );
}
