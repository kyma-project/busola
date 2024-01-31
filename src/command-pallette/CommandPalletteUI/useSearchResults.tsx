import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { columnLayoutState } from 'state/columnLayoutAtom';

import * as handlers from './handlers';
import { useGetHiddenNamespaces } from 'shared/hooks/useGetHiddenNamespaces';
import { K8sResource } from 'types';
import { clustersState } from 'state/clustersAtom';
import { clusterState } from 'state/clusterAtom';
import { availableNodesSelector } from 'state/navigation/availableNodesSelector';
import { CommandPaletteContext, HelpEntries, Result } from './types';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { useNavigate, To } from 'react-router-dom';
import { showYamlUploadDialogState } from 'state/showYamlUploadDialogAtom';

type useSearchResultsProps = {
  query: string;
  namespaceContext: string | null;
  hideCommandPalette: () => void;
  resourceCache: Record<string, K8sResource[]>;
  updateResourceCache: (key: string, value: any) => void;
};

type SearchResults = {
  results: Result[];
  suggestedQuery: string;
  autocompletePhrase: string | null;
  helpEntries: HelpEntries;
};

export function useSearchResults({
  query,
  namespaceContext,
  hideCommandPalette,
  resourceCache,
  updateResourceCache,
}: useSearchResultsProps): SearchResults {
  const clusters = useRecoilValue(clustersState);
  const cluster = useRecoilValue(clusterState);
  const availableNodes = useRecoilValue(availableNodesSelector);
  const setLayoutColumn = useSetRecoilState(columnLayoutState);

  const hiddenNamespaces = useGetHiddenNamespaces();
  const showHiddenNamespaces = useRecoilValue(showHiddenNamespacesState);
  const fetch = useFetch();
  const { t } = useTranslation();
  const setOpenPreferencesModal = useSetRecoilState(isPreferencesOpenState);
  const setShowYamlUpload = useSetRecoilState(showYamlUploadDialogState);
  const clustersInfo = useClustersInfo();
  const navigate = useNavigate();

  const navigateAndCloseColumns = (to: To) => {
    setLayoutColumn({
      layout: 'OneColumn',
      midColumn: null,
      endColumn: null,
    });
    navigate(to);
  };

  const preprocessedQuery = query.trim().toLowerCase();
  const context: CommandPaletteContext = {
    fetch: (relativeUrl: string) => fetch({ relativeUrl }),
    namespace: namespaceContext || 'default',
    clusterNames: Object.keys(clusters || {}),
    activeClusterName: cluster?.name,
    query: preprocessedQuery,
    tokens: preprocessedQuery.split(/(\/+)/).filter(Boolean),
    clusterNodes: availableNodes.filter(n => !n.namespaced),
    namespaceNodes: availableNodes.filter(n => n.namespaced),
    hiddenNamespaces,
    showHiddenNamespaces,
    resourceCache,
    updateResourceCache,
    t,
    setOpenPreferencesModal,
    setShowYamlUpload,
    clustersInfo,
    navigate: navigateAndCloseColumns,
  };

  useEffect(() => {
    if (query) {
      handlers.fetchResources(context);
    }
  }, [query, namespaceContext]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = handlers.createResults(context).map(result => ({
    ...result,
    onActivate: () => {
      // entry can explicitly prevent hiding of command palette by returning false
      if ('onActivate' in result && result.onActivate() !== false) {
        hideCommandPalette();
      }
    },
  }));

  const matchedResult =
    results?.find((result: any) => result.aliases?.includes(query)) ??
    results.find((result: any) => result.query === query);

  if (matchedResult) {
    const index = results.indexOf(matchedResult);
    results.splice(index, 1);
    results.unshift(matchedResult);
  }

  return {
    results: results,
    suggestedQuery: handlers.getSuggestions(context)[0],
    autocompletePhrase: handlers.getAutocompleteEntries(context),
    helpEntries: handlers.getHelpEntries(context),
  };
}
