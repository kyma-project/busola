import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Menu, Button } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { useEventListener } from 'hooks/useEventListener';
import { useCustomMessageListener } from 'hooks/useCustomMessageListener';

import 'core-js/es/array/flat-map';

import { MESSAGES } from 'shared/components/GenericList/constants';
import { getEntryMatches } from 'shared/components/GenericList/helpers';
import { Tooltip } from '../Tooltip/Tooltip';

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
  i18n,
  allowSlashShortcut,
}) {
  const { t } = useTranslation(null, { i18n });
  const [isSearchHidden, setSearchHidden] = React.useState(true);
  const searchInputRef = React.useRef();

  const onKeyPress = e => {
    const { key } = e;

    const isCommandPalleteOpen = !!document.querySelector(
      '#command-palette-background',
    );
    if (isCommandPalleteOpen) return;

    if (key === '/' && !disabled && allowSlashShortcut) {
      openSearchList();
    }
  };

  useEffect(() => {
    if (!isSearchHidden) {
      openSearchList();
    }
  }, [isSearchHidden]);

  useEventListener('keydown', onKeyPress, [disabled, allowSlashShortcut]);
  useCustomMessageListener(
    'busola.toggle-open-search',
    () => {
      if (!disabled && allowSlashShortcut) {
        setSearchHidden(false);
      }
    },
    [disabled, allowSlashShortcut],
  );

  const renderSearchList = entries => {
    const suggestions = getSearchSuggestions(entries);

    if (!suggestions.length) {
      return (
        <Menu.Item className="no-entries">
          {MESSAGES.NO_SEARCH_RESULT}
        </Menu.Item>
      );
    }

    return suggestions.map(suggestion => (
      <Menu.Item onClick={() => handleQueryChange(suggestion)} key={suggestion}>
        {suggestion}
      </Menu.Item>
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
      const inputField = searchInputRef.current;
      inputField.focus();
    });
  };

  const handleOnKeyDown = e => {
    const ESCAPE_KEY_CODE = 27;
    if (e.keyCode === ESCAPE_KEY_CODE) {
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
            <input
              aria-label="search-input"
              ref={searchInputRef}
              type="search"
              placeholder={t('common.tooltips.search')}
              value={searchQuery}
              onBlur={() => setSearchHidden(true)}
              onFocus={() => setSearchHidden(false)}
              onChange={e => handleQueryChange(e.target.value)}
              onKeyDown={handleOnKeyDown}
              className="fd-margin-none fd-input"
            />
            {!!searchQuery && showSuggestion && (
              <div
                className="fd-popover__body fd-popover__body--no-arrow"
                aria-hidden={isSearchHidden}
              >
                <Menu>{renderSearchList(filteredEntries)}</Menu>
              </div>
            )}
          </div>
        </div>
      </div>
      {showControl && (
        <Tooltip content={t('common.tooltips.search')}>
          <Button
            disabled={disabled}
            option="transparent"
            glyph="search"
            onClick={openSearchList}
            aria-label="open-search"
          />
        </Tooltip>
      )}
    </section>
  );
}
