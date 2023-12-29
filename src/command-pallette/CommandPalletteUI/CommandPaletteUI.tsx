import { ReactNode, useEffect, useState } from 'react';
import { useEventListener } from 'hooks/useEventListener';
import {
  CommandPalletteHelp,
  NamespaceContextDisplay,
  ShortHelpText,
  SuggestedQuery,
} from './components/components';
import { ResultsList } from './ResultsList/ResultsList';
import { addHistoryEntry, getHistoryEntries } from './search-history';
import { useSearchResults } from './useSearchResults';
import './CommandPaletteUI.scss';
import { K8sResource } from 'types';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { Icon, Input } from '@ui5/webcomponents-react';

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
  showCommandPalette: boolean;
  hide: () => void;
  resourceCache: Record<string, K8sResource[]>;
  updateResourceCache: (key: string, resources: K8sResource[]) => void;
};

export function CommandPaletteUI({
  showCommandPalette,
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
  useEffect(() => {
    document.getElementById('command-palette-search')?.focus();
  }, []);

  const commandPaletteInput = document.getElementById('command-palette-search');

  const handleQuerySelection = () => {
    const innerInput = commandPaletteInput?.shadowRoot?.querySelector(
      '.ui5-input-inner',
    ) as HTMLInputElement;
    if (innerInput.selectionEnd === innerInput.selectionStart) {
      innerInput?.focus();
      let startIndex = 0;

      if (query.lastIndexOf('/') === query.length - 1) {
        startIndex = query.lastIndexOf('/', query.lastIndexOf('/') - 1) + 1;
      } else {
        startIndex = query.lastIndexOf('/') + 1;
      }

      setTimeout(() => innerInput.setSelectionRange(startIndex, query.length));
    }
  };

  const keyDownInHistoryMode = (key: string, e: Event) => {
    const historyEntries = getHistoryEntries();
    if (key === 'Enter' && results[0]) {
      // choose current entry
      addHistoryEntry(results[0].query);
      results[0].onActivate();
    } else if (key === 'Tab') {
      e.preventDefault();
      // fill search with active history entry
      setQuery(historyEntries[historyIndex] + '/');
      setActiveResultIndex(0);
      setHistoryMode(false);
    } else if (key === 'ArrowUp') {
      // try going up in history
      const entry = historyEntries[historyIndex + 1];
      if (entry) {
        setHistoryIndex(historyIndex + 1);
        setQuery(entry);
      }
    } else if (key === 'ArrowDown') {
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

  const keyDownInDropdownMode = (key: string, e: Event) => {
    if (key === 'Tab') {
      e.preventDefault();
      if (autocompletePhrase) {
        setQuery(autocompletePhrase + '/');
      } else if (suggestedQuery && !query.endsWith('/')) {
        setQuery(suggestedQuery + '/');
      } else if (
        results?.[activeResultIndex] // && todo
        // results[activeResultIndex] !== LOADING_INDICATOR
      ) {
        // fill search with active result
        setQuery(results[activeResultIndex].query + '/' || '');
      }
    } else if (key === 'ArrowUp') {
      const historyEntries = getHistoryEntries();
      if (activeResultIndex === 0 && historyEntries.length) {
        // activate history mode
        setOriginalQuery(query);
        setQuery(historyEntries[historyIndex]);
        setHistoryMode(true);
        setHistoryIndex(0);
      }
    } else if (key === 'Backspace' && query.includes('/')) {
      handleQuerySelection();
    }
  };

  const showHelp = query === '?' || query === 'help';
  useEventListener(
    'keydown',
    (e: Event) => {
      const { key } = e as KeyboardEvent;
      return !isHistoryMode
        ? keyDownInDropdownMode(key, e)
        : keyDownInHistoryMode(key, e);
    },
    [isHistoryMode, activeResultIndex, query],
  );
  console.log(results);
  return (
    <Background hide={hide}>
      <div className="command-palette-ui__wrapper" role="dialog">
        <div className="command-palette-ui__content">
          <NamespaceContextDisplay
            namespaceContext={namespaceContext}
            setNamespaceContext={setNamespaceContext}
          />
          <Input
            id="command-palette-search"
            aria-label="command-palette-search"
            value={!isHistoryMode ? query : ''}
            placeholder={!isHistoryMode ? '' : query}
            onInput={(e: any) => setQuery((e.target as HTMLInputElement).value)}
            showClearIcon
            className="search-with-magnifying-glass full-width"
            icon={<Icon name="slim-arrow-right" />}
          />
          {!showHelp && query && (
            <ResultsList
              results={results}
              isHistoryMode={isHistoryMode}
              suggestion={
                <SuggestedQuery
                  suggestedQuery={suggestedQuery}
                  setQuery={(query: string) => {
                    setQuery(query);
                    commandPaletteInput?.focus();
                  }}
                />
              }
              activeIndex={activeResultIndex}
              setActiveIndex={setActiveResultIndex}
            />
          )}
          {!showHelp && !query && (
            <ResultsList
              results={results}
              isHistoryMode={isHistoryMode}
              suggestion={
                <SuggestedQuery
                  suggestedQuery={suggestedQuery}
                  setQuery={(query: string) => {
                    setQuery(query);
                    commandPaletteInput?.focus();
                  }}
                />
              }
              activeIndex={activeResultIndex}
              setActiveIndex={setActiveResultIndex}
            />
          )}
          {showHelp && <CommandPalletteHelp helpEntries={helpEntries} />}
          {!showHelp && (
            <ShortHelpText
              showFullHelp={() => {
                setQuery('help');
                commandPaletteInput?.focus();
              }}
            />
          )}
        </div>
      </div>
    </Background>
  );
}
