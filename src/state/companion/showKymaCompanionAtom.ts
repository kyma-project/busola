import { atom } from 'jotai';

export type InsightsTarget = {
  resourceKind: string;
  resourceName: string;
  resourceApiVersion: string;
  namespace: string;
  additionalContext?: string;
};

export type ShowKymaCompanion = {
  show: boolean;
  fullScreen: boolean;
  useJoule: boolean;
  insightsTarget?: InsightsTarget | null;
};

const DEFAULT_SHOW_KYMA_COMPANION: ShowKymaCompanion = {
  show: false,
  fullScreen: false,
  useJoule: false,
  insightsTarget: null,
};

export const showKymaCompanionAtom = atom<ShowKymaCompanion>(
  DEFAULT_SHOW_KYMA_COMPANION,
);
showKymaCompanionAtom.debugLabel = 'showKymaCompanionAtom';
