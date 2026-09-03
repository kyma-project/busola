import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import type { PodDisruptionBudget } from './types';

export const customColumns = (t: (key: string) => string) => [
  {
    header: t('pod-disruption-budgets.headers.min-available'),
    value: (podDisruptionBudget: PodDisruptionBudget) =>
      podDisruptionBudget.spec?.minAvailable ?? EMPTY_TEXT_PLACEHOLDER,
  },
  {
    header: t('pod-disruption-budgets.headers.max-unavailable'),
    value: (podDisruptionBudget: PodDisruptionBudget) =>
      podDisruptionBudget.spec?.maxUnavailable ?? EMPTY_TEXT_PLACEHOLDER,
  },
  {
    header: t('pod-disruption-budgets.headers.current-healthy'),
    value: (podDisruptionBudget: PodDisruptionBudget) =>
      podDisruptionBudget.status?.currentHealthy ?? EMPTY_TEXT_PLACEHOLDER,
  },
  {
    header: t('pod-disruption-budgets.headers.desired-healthy'),
    value: (podDisruptionBudget: PodDisruptionBudget) =>
      podDisruptionBudget.status?.desiredHealthy ?? EMPTY_TEXT_PLACEHOLDER,
  },
  {
    header: t('pod-disruption-budgets.headers.disruptions-allowed'),
    value: (podDisruptionBudget: PodDisruptionBudget) =>
      podDisruptionBudget.status?.disruptionsAllowed ?? EMPTY_TEXT_PLACEHOLDER,
  },
];
