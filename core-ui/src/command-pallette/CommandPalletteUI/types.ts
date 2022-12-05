import { TFunction } from 'react-i18next';
import { NavNode } from 'state/types';
import { useClustersInfoType } from 'state/utils/getClustersInfo';
import { K8sResource } from 'types';

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
  t: TFunction<'translation', undefined>;
  updateResourceCache: (key: string, resources: K8sResource[]) => void;
  setOpenPreferencesModal: (open: boolean) => void;
  clustersInfo: useClustersInfoType;
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
  query: string;
  onActivate: () => boolean | void;
  customActionText?: string;
};

export type Handler = {
  getSuggestions: (ctx: CommandPaletteContext) => string[];
  getAutocompleteEntries: (ctx: CommandPaletteContext) => {};
  fetchResources?: (ctx: CommandPaletteContext) => Promise<any>;
  getNavigationHelp?: (ctx: CommandPaletteContext) => NavigationHelpEntries[];
  getOthersHelp?: (ctx: CommandPaletteContext) => OthersHelpEntries[];
  getCRsHelp?: (ctx: CommandPaletteContext) => CRHelpEntries[];
  createResults: (ctx: CommandPaletteContext) => Result[] | null;
};
