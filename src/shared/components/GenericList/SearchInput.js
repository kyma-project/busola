import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, ComboBox, ComboBoxItem } from '@ui5/webcomponents-react';
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
    '#ui5-combobox-input',
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
        <ComboBoxItem
          text={MESSAGES.NO_SEARCH_RESULT}
          id={MESSAGES.NO_SEARCH_RESULT}
        />
      );
    }

    return suggestions.map(suggestion => (
      <ComboBoxItem id={suggestion} text={suggestion} />
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
        style={{ display: showControl ? 'none' : 'initial' }}
        aria-expanded={!showControl}
      >
        <ComboBox
          id="search-input"
          aria-label="search-input"
          placeholder={t('common.tooltips.search')}
          value={searchQuery}
          onInput={e => handleQueryChange(e.target.value)}
          onChange={() => setSearchHidden(true)}
          className="search-with-magnifying-glass"
        >
          {!!searchQuery && showSuggestion && renderSearchList(filteredEntries)}
        </ComboBox>
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
