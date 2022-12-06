import { TFunction } from 'react-i18next';
import { NavigateFunction } from 'react-router-dom';
import { NavNode } from 'state/types';
import { useClustersInfoType } from 'state/utils/getClustersInfo';
import { K8sResource } from 'types';

export const LOADING_INDICATOR = 'LOADING_INDICATOR';

export type CommandPaletteContext = {
  fetch: (relativeUrl: string) => Promise<any>;
  namespace: string | null;
  clusterNames: string[];
  activeClusterName: string | undefined;
  query: string;
  tokens: string[];
  clusterNodes: NavNode[];
  namespaceNodes: NavNode[];
  hiddenNamespaces: string[];
  showHiddenNamespaces: boolean;
  resourceCache: Record<string, K8sResource[]>;
  updateResourceCache: (key: string, resources: K8sResource[]) => void;
  t: TFunction<'translation', undefined>;
  setOpenPreferencesModal: (open: boolean) => void;
  clustersInfo: useClustersInfoType;
  navigate: NavigateFunction;
};

type CRHelpEntries = {
  name: string;
  shortNames: string[];
  description: string; // todo
};
type NavigationHelpEntries = {
  name: string;
  aliases?: string[];
};

type OthersHelpEntries = {
  name: string;
  alias: string;
  description: string;
};

export type HelpEntries = {
  crds: CRHelpEntries[];
  navigation: NavigationHelpEntries[];
  others: OthersHelpEntries[];
};

export type Result = {
  label: string;
  category?: string;
  query: string;
  onActivate: () => boolean | void;
  customActionText?: string;
  type?: 'LOADING_INDICATOR';
};

export type Handler = {
  getSuggestions: (ctx: CommandPaletteContext) => string[];
  getAutocompleteEntries: (ctx: CommandPaletteContext) => string[] | null;
  fetchResources?: (ctx: CommandPaletteContext) => Promise<any>;
  getNavigationHelp?: (ctx: CommandPaletteContext) => NavigationHelpEntries[];
  getOthersHelp?: (ctx: CommandPaletteContext) => OthersHelpEntries[];
  getCRsHelp?: (ctx: CommandPaletteContext) => CRHelpEntries[];
  createResults: (ctx: CommandPaletteContext) => Result[] | null;
};
