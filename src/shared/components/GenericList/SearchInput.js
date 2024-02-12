import { useContext } from 'react';
import PropTypes from 'prop-types';
import { ComboBox, ComboBoxItem } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useEventListener } from 'hooks/useEventListener';

import { MESSAGES } from 'shared/components/GenericList/constants';
import { getEntryMatches } from 'shared/components/GenericList/helpers';
import { useYamlEditor } from 'shared/contexts/YamlEditorContext/YamlEditorContext';
import { ResourceDetailContext } from '../ResourceDetails/ResourceDetails';

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
  const { isOpen: isSideDrawerOpened } = useYamlEditor();
  const isDetailsView = useContext(ResourceDetailContext);

  const onKeyPress = e => {
    const { key } = e;

    const isCommandPalleteOpen = !!document.querySelector(
      '#command-palette-background',
    );
    if (isCommandPalleteOpen) return;

    const isModalOpen = document.querySelector(
      '[accessible-role="Dialog"][open="true"]',
    );
    if (isModalOpen) return;

    if (isDetailsView) return;

    if (key === '/' && !disabled && allowSlashShortcut && !isSideDrawerOpened) {
      // Prevent firefox native quick find panel open
      e.preventDefault();
      openSearchList();
    }

    handleOnKeyDown(key);
  };

  const searchInput = document.querySelector('#search-input');
  const searchInputShadowElement = searchInput?.shadowRoot?.querySelector(
    '#ui5-combobox-input',
  );

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
    setTimeout(() => {
      searchInputShadowElement?.focus();
    });
  };

  const handleOnKeyDown = e => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <section
      className="generic-list-search"
      aria-label={`search-${entriesKind}`}
      role="search"
    >
      {showSearchControl && (
        <div aria-expanded={showSearchControl}>
          <ComboBox
            id="search-input"
            aria-label="search-input"
            placeholder={t('common.tooltips.search')}
            value={searchQuery}
            onInput={e => handleQueryChange(e.target.value)}
            className="search-with-magnifying-glass"
          >
            {!!searchQuery &&
              showSuggestion &&
              renderSearchList(filteredEntries)}
          </ComboBox>
        </div>
      )}
    </section>
  );
}
