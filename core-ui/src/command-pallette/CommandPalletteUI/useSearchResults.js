import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import * as handlers from './handlers';
import { useGetHiddenNamespaces } from 'shared/hooks/useGetHiddenNamespaces';

export const LOADING_INDICATOR = 'LOADING_INDICATOR';

export function useSearchResults({
  query,
  namespaceContext,
  hideCommandPalette,
  resourceCache,
  updateResourceCache,
}) {
  const {
    clusters,
    activeClusterName,
    clusterNodes,
    namespaceNodes,
  } = useMicrofrontendContext();
  const hiddenNamespaces = useGetHiddenNamespaces();
  const showHiddenNamespaces = useRecoilValue(showHiddenNamespacesState);
  const fetch = useFetch();
  const { t } = useTranslation();
  const setOpenPreferencesModal = useSetRecoilState(isPreferencesOpenState);

  const preprocessedQuery = query.trim().toLowerCase();
  const context = {
    fetch: url => fetch({ relativeUrl: url }),
    namespace: namespaceContext || 'default',
    clusterNames: Object.keys(clusters || {}),
    activeClusterName,
    query: preprocessedQuery,
    tokens: preprocessedQuery.split(/\s+/).filter(Boolean),
    clusterNodes: clusterNodes || [],
    namespaceNodes: namespaceNodes || [],
    hiddenNamespaces,
    showHiddenNamespaces,
    resourceCache,
    updateResourceCache,
    t,
    setOpenPreferencesModal,
  };

  useEffect(() => {
    if (query) {
      handlers.fetchResources(context);
    }
  }, [query, namespaceContext]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    results: handlers.createResults(context).map(result => ({
      ...result,
      onActivate: () => {
        // entry can explicitly prevent hiding of command palette by returning false
        if (result.onActivate() !== false) {
          hideCommandPalette();
        }
      },
    })),
    suggestedQuery: handlers.getSuggestions(context)[0],
    autocompletePhrase: handlers.getAutocompleteEntries(context),
    helpEntries: handlers.getHelpEntries(context),
  };
}
