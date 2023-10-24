import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Menu, MenuItem } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useEventListener } from 'hooks/useEventListener';

import 'core-js/es/array/flat-map';

import { MESSAGES } from 'shared/components/GenericList/constants';
import { getEntryMatches } from 'shared/components/GenericList/helpers';
import { Tooltip } from '../Tooltip/Tooltip';
import { useYamlEditor } from 'shared/contexts/YamlEditorContext/YamlEditorContext';

SearchInput.propTypes = {
  searchQuery: PropTypes.string,
  entriesKind: PropTypes.string,
  entries: PropTypes.arrayOf(PropTypes.object.isRequired),
  handleQueryChange: PropTypes.func.isRequired,
  suggestionProperties: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.func.isRequired,
    ]),
  ),
  showSuggestion: PropTypes.bool,
  showSearchControl: PropTypes.bool,
  disabled: PropTypes.bool,
  onKeyDown: PropTypes.func,
};

export function SearchInput({
  searchQuery,
  entriesKind,
  filteredEntries,
  handleQueryChange,
  suggestionProperties,
  showSuggestion = true,
  showSearchControl = true,
  disabled = false,
  onKeyDown,
  allowSlashShortcut,
}) {
  const { t } = useTranslation();
  const [isSearchHidden, setSearchHidden] = React.useState(true);
  const { isOpen: isSideDrawerOpened } = useYamlEditor();

  const onKeyPress = e => {
    const { key } = e;

    const isCommandPalleteOpen = !!document.querySelector(
      '#command-palette-background',
    );
    if (isCommandPalleteOpen) return;

    if (key === '/' && !disabled && allowSlashShortcut && !isSideDrawerOpened) {
      openSearchList();
    }

    handleOnKeyDown(key);
  };

  const searchInput = document.querySelector('#search-input');
  const searchInputShadowElement = searchInput?.shadowRoot.querySelector(
    '.ui5-input-inner',
  );

  searchInputShadowElement?.addEventListener('blur', () =>
    setSearchHidden(true),
  );
  searchInputShadowElement?.addEventListener('focus', () =>
    setSearchHidden(false),
  );

  useEffect(() => {
    if (!isSearchHidden) {
      openSearchList();
    }
  }, [isSearchHidden]); // eslint-disable-line react-hooks/exhaustive-deps

  useEventListener('keydown', onKeyPress, [
    disabled,
    allowSlashShortcut,
    isSideDrawerOpened,
  ]);

  const renderSearchList = entries => {
    const suggestions = getSearchSuggestions(entries);

    if (!suggestions.length) {
      return (
        <MenuItem className="no-entries" text={MESSAGES.NO_SEARCH_RESULT} />
      );
    }

    return suggestions.map(suggestion => (
      <MenuItem key={suggestion} text={suggestion} />
    ));
  };

  const getSearchSuggestions = entries => {
    const suggestions = entries
      .flatMap(entry =>
        getEntryMatches(entry, searchQuery, suggestionProperties),
      )
      .filter(suggestion => suggestion);
    return Array.from(new Set(suggestions));
  };

  const openSearchList = () => {
    setSearchHidden(false);
    setTimeout(() => {
      searchInputShadowElement?.focus();
    });
  };

  const handleOnKeyDown = e => {
    if (e.key === 'Enter') {
      setSearchHidden(true);
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const showControl = showSearchControl && isSearchHidden && !searchQuery;

  return (
    <section
      className="generic-list-search"
      aria-label={`search-${entriesKind}`}
      role="search"
    >
      <div
        className="fd-popover"
        style={{ display: showControl ? 'none' : 'initial' }}
        aria-expanded={!showControl}
      >
        <div className="fd-popover__control">
          <div className="fd-combobox-control">
            <Input
              id="search-input"
              aria-label="search-input"
              placeholder={t('common.tooltips.search')}
              value={searchQuery}
              onInput={e => handleQueryChange(e.target.value)}
              showClearIcon
              className="search-with-magnifying-glass "
            />
            {!!searchQuery && showSuggestion && (
              <Menu
                open={!isSearchHidden}
                opener="search-input"
                onAfterClose={() => {
                  setSearchHidden(true);
                }}
                onItemClick={e => handleQueryChange(e.detail.item.textContent)}
              >
                {renderSearchList(filteredEntries)}
              </Menu>
            )}
          </div>
        </div>
      </div>
      {showControl && (
        <Tooltip content={t('common.tooltips.search')}>
          <Button
            disabled={disabled}
            design="Transparent"
            icon="search"
            onClick={openSearchList}
            aria-label="open-search"
          />
        </Tooltip>
      )}
    </section>
  );
}
