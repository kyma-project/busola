import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Button } from 'fundamental-react';

import 'core-js/es/array/flat-map';

import { MESSAGES } from './constants';

SearchInput.propTypes = {
  searchQuery: PropTypes.string,
  entriesKind: PropTypes.string,
  entries: PropTypes.arrayOf(PropTypes.object.isRequired),
  handleQueryChange: PropTypes.func.isRequired,
  suggestionProperties: PropTypes.arrayOf(PropTypes.string.isRequired),
  showSuggestion: PropTypes.bool,
  showSearchControl: PropTypes.bool,
  disabled: PropTypes.bool,
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
}) {
  const [isSearchHidden, setSearchHidden] = React.useState(true);
  const searchInputRef = React.useRef();

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
      .flatMap(entry => {
        if (typeof entry === 'string') {
          if (entryMatchesSearch(entry)) return entry;
        }
        return suggestionProperties?.map(properties => {
          const propertiesArray = properties.split('.');
          let entryValue = entry;
          propertiesArray?.forEach(prop => {
            entryValue = entryValue[prop];
          });
          if (entryMatchesSearch(entryValue)) return entryValue;
        });
      })
      .filter(suggestion => suggestion);
    return Array.from(new Set(suggestions));
  };

  const entryMatchesSearch = entry => {
    return (
      entry &&
      entry
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  };

  const openSearchList = () => {
    setSearchHidden(false);
    setImmediate(() => {
      const inputField = searchInputRef.current;
      inputField.focus();
    });
  };

  const checkForEscapeKey = e => {
    const ESCAPE_KEY_CODE = 27;
    if (e.keyCode === ESCAPE_KEY_CODE) {
      setSearchHidden(true);
    }
  };

  const showControl = showSearchControl && isSearchHidden && !searchQuery;
  return (
    <section
      className="generic-list-search"
      role="search"
      aria-label={`search-${entriesKind}`}
    >
      <div
        className="fd-popover"
        style={{ display: showControl ? 'none' : 'initial' }}
      >
        <div className="fd-popover__control">
          <div className="fd-combobox-control">
            <input
              aria-label="search-input"
              ref={searchInputRef}
              type="text"
              placeholder="Search"
              value={searchQuery}
              onBlur={() => setSearchHidden(true)}
              onFocus={() => setSearchHidden(false)}
              onChange={e => handleQueryChange(e.target.value)}
              onKeyPress={checkForEscapeKey}
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
        <Button
          disabled={disabled}
          option="transparent"
          glyph="search"
          onClick={openSearchList}
          aria-label="open-search"
        />
      )}
    </section>
  );
}
