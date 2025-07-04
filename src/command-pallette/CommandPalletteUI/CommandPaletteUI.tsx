import { ReactNode, useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useEventListener } from 'hooks/useEventListener';
import { addHistoryEntry, getHistoryEntries } from './search-history';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import {
  CommandPalletteHelp,
  NamespaceContextDisplay,
  ShortHelpText,
  SuggestedQuery,
} from './components/components';
import { ResultsList } from './ResultsList/ResultsList';
import { useSearchResults } from './useSearchResults';
import { K8sResource } from 'types';
import { Button, Icon, Input } from '@ui5/webcomponents-react';
import './CommandPaletteUI.scss';
import { showKymaCompanionState } from 'state/companion/showKymaCompanionAtom';
import { SCREEN_SIZE_BREAKPOINT_M } from './types';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';

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
  shellbarWidth: number;
};

export function CommandPaletteUI({
  showCommandPalette,
  hide,
  resourceCache,
  updateResourceCache,
  shellbarWidth,
}: CommandPaletteProps) {
  const namespace = useRecoilValue(activeNamespaceIdState);
  const { navigateSafely } = useFormNavigation();

  const [query, setQuery] = useState('');
  const [originalQuery, setOriginalQuery] = useState('');
  const [namespaceContext, setNamespaceContext] = useState<string | null>(
    namespace,
  );

  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [isHistoryMode, setHistoryMode] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);
  const showCompanion = useRecoilValue(showKymaCompanionState);

  const commandPaletteRef = useRef<HTMLDivElement | null>(null);

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
    setTimeout(
      () => document.getElementById('command-palette-search')?.focus(),
      100,
    );
  }, []);

  useEffect(() => {
    const headerInput = document.getElementById('command-palette-search-bar');
    const headerSlot = document
      .querySelector('ui5-shellbar')
      ?.shadowRoot?.querySelector('.ui5-shellbar-search-field') as HTMLElement;
    const paletteCurrent = commandPaletteRef.current;

    if (!showCommandPalette || !headerSlot) return;

    //show search bar when Command Palette is open
    document
      .querySelector('ui5-shellbar')
      ?.setAttribute('show-search-field', '');
    headerSlot.style.display = 'flex';

    //position Command Palette
    if (
      shellbarWidth > SCREEN_SIZE_BREAKPOINT_M &&
      headerInput &&
      paletteCurrent
    ) {
      const shellbarRect = headerInput.getBoundingClientRect();
      paletteCurrent.style.right = `${shellbarWidth - shellbarRect.right}px`;
      paletteCurrent.style.left = 'unset';
      paletteCurrent.style.opacity = '100%'; //prevent visually jumping
    } else if (paletteCurrent) {
      paletteCurrent.style.right = '0px';
      paletteCurrent.style.left = '0px';
    }
  }, [showCommandPalette, shellbarWidth]); // eslint-disable-line react-hooks/exhaustive-deps

  const commandPaletteInput = document.getElementById('command-palette-search');

  const handleQuerySelection = () => {
    const innerInput = commandPaletteInput?.shadowRoot?.querySelector(
      '.ui5-input-inner',
    ) as HTMLInputElement;
    if (innerInput.selectionEnd === innerInput.selectionStart) {
      innerInput?.focus();
      let startIndex = 0;

      if (query.endsWith('/')) {
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
      e.preventDefault();
      navigateSafely(() => {
        addHistoryEntry(results[0].query);
        results[0].onActivate();
      });
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
      } else if (results?.[activeResultIndex]) {
        // fill search with active result
        setQuery(results[activeResultIndex]?.query + '/' || '');
      } else if (suggestedQuery) {
        setQuery(suggestedQuery);
      }
      setActiveResultIndex(0);
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
      if (key === 'Escape') {
        hide();
      }

      return !isHistoryMode
        ? keyDownInDropdownMode(key, e)
        : keyDownInHistoryMode(key, e);
    },
    [isHistoryMode, activeResultIndex, query, results],
  );

  return (
    <Background hide={hide}>
      <div
        className={`command-palette-ui__wrapper ${
          showCompanion.show && shellbarWidth < SCREEN_SIZE_BREAKPOINT_M
            ? 'full-size'
            : ''
        }`}
        role="dialog"
        ref={commandPaletteRef}
      >
        <div className="command-palette-ui__content">
          <NamespaceContextDisplay
            namespaceContext={namespaceContext}
            setNamespaceContext={setNamespaceContext}
          />
          <div className="input-container">
            <Button
              className="input-back-button"
              design="Transparent"
              onClick={hide}
            >
              <Icon name="nav-back"></Icon>
            </Button>
            <Input
              id="command-palette-search"
              accessibleName="command-palette-search"
              value={!isHistoryMode ? query : ''}
              placeholder={!isHistoryMode ? '' : query}
              onInput={(e: any) =>
                setQuery((e.target as HTMLInputElement).value)
              }
              showClearIcon
              className="search-with-display-more full-width"
              icon={<Icon name="slim-arrow-right" />}
            />
          </div>
          {!showHelp && (
            <>
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
              <ShortHelpText />
            </>
          )}
          {showHelp && <CommandPalletteHelp helpEntries={helpEntries} />}
        </div>
      </div>
    </Background>
  );
}
