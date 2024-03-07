import { useContext } from 'react';
import PropTypes from 'prop-types';
import { Input, SuggestionItem } from '@ui5/webcomponents-react';
import '@ui5/webcomponents/dist/features/InputSuggestions.js';
import { useTranslation } from 'react-i18next';
import { useEventListener } from 'hooks/useEventListener';

import { getEntryMatches } from 'shared/components/GenericList/helpers';
import { useYamlEditor } from 'shared/contexts/YamlEditorContext/YamlEditorContext';
import { ResourceDetailContext } from '../ResourceDetails/ResourceDetails';

SearchInput.propTypes = {
  searchQuery: PropTypes.string,
  entriesKind: PropTypes.string,
  filteredEntries: PropTypes.arrayOf(PropTypes.object.isRequired),
  handleQueryChange: PropTypes.func.isRequired,
  suggestionProperties: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.func.isRequired,
    ]),
  ),
  showSuggestion: PropTypes.bool,
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
  disabled = false,
  onKeyDown,
}) {
  const { t } = useTranslation();
  const { isOpen: isSideDrawerOpened } = useYamlEditor();
  const isDetailsView = useContext(ResourceDetailContext);

  const onKeyPress = e => {
    const { key } = e;
    if (!onKeyDown) return;
    if (isDetailsView) return;
    const isCommandPalleteOpen = document.querySelector(
      '#command-palette-background',
    );
    if (isCommandPalleteOpen) return;
    const isModalOpen = document.querySelector(
      '[accessible-role="Dialog"][open="true"]',
    );
    if (isModalOpen) return;
    onKeyDown(key);
  };

  useEventListener('keydown', onKeyPress, [disabled, isSideDrawerOpened]);

  const renderSearchList = entries => {
    const suggestions = getSearchSuggestions(entries);

    return suggestions.map(suggestion => (
      <SuggestionItem id={suggestion} text={suggestion} waitForDefine={true} />
    ));
  };

  const getSearchSuggestions = entries => {
    if (!entries) return [];
    const suggestions = entries
      .flatMap(entry =>
        getEntryMatches(entry, searchQuery, suggestionProperties),
      )
      .filter(suggestion => suggestion);
    return Array.from(new Set(suggestions));
  };

  return (
    <Input
      id="search-input"
      aria-label={`search-${entriesKind}`}
      role="search"
      type="Text"
      placeholder={t('common.tooltips.search')}
      className="search-with-magnifying-glass"
      value={searchQuery}
      onInput={e => handleQueryChange(e.target.value)}
      showSuggestions={showSuggestion}
      waitForDefine={true}
    >
      {showSuggestion && renderSearchList(filteredEntries)}
    </Input>
  );
}
