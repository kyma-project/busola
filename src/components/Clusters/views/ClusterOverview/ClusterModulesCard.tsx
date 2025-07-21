import { useTranslation } from 'react-i18next';
import { Button } from '@ui5/webcomponents-react';
import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import { useKymaModulesQuery } from 'components/KymaModules/kymaModulesQueries';
import { useUrl } from 'hooks/useUrl';
import { useNavigate } from 'react-router';
import { useGetAllModulesStatuses } from 'components/KymaModules/hooks';
import { useContext, useMemo } from 'react';
import { CommunityModuleContext } from 'components/KymaModules/providers/CommunityModuleProvider';

const CountStatuseByType = (
  statuses: Record<string, any>,
  loadingStatuses: boolean,
  statusesError: Error | null,
) => {
  if (statuses && !loadingStatuses && !statusesError) {
    return statuses.reduce(
      (
        acc: {
          ready: number;
          error: number;
          warning: number;
          processing: number;
          other: number;
        },
        m: { status: string },
      ) => {
        if (m?.status === 'Ready') acc.ready++;
        else if (m?.status === 'Error') acc.error++;
        else if (m?.status === 'Warning') acc.warning++;
        else if (m?.status === 'Processing') acc.processing++;
        else acc.other++;
        return acc;
      },
      { ready: 0, error: 0, warning: 0, processing: 0, other: 0 },
    );
  }
  return { ready: 0, error: 0, warning: 0, processing: 0, other: 0 };
};
export default function ClusterModulesCard() {
  const { t } = useTranslation();
  const {
    installedCommunityModules,
    installedCommunityModulesLoading,
  } = useContext(CommunityModuleContext);
  const { modules, error, loading: loadingModules } = useKymaModulesQuery();
  const { clusterUrl } = useUrl();
  const navigate = useNavigate();
  const {
    data: statuses,
    loading: loadingStatuses,
    error: statusesError,
  } = useGetAllModulesStatuses(modules);

  const moduleStatusCounts = useMemo(() => {
    return CountStatuseByType(statuses, loadingStatuses, statusesError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statuses, statusesError]);

  const display =
    !error && !loadingModules && modules && !installedCommunityModulesLoading;

  return (
    <>
      {display && (
        <CountingCard
          className="modules-statuses"
          value={modules?.length + installedCommunityModules?.length}
          title={t('cluster-overview.statistics.modules-overview')}
          subTitle={t('kyma-modules.installed-modules')}
          extraInfo={[
            {
              title: t('kyma-modules.installed-community-modules'),
              value: installedCommunityModules?.length,
            },
            {
              title: t('common.statuses.ready'),
              value: moduleStatusCounts.ready,
            },
            {
              title: t('common.statuses.warning'),
              value: moduleStatusCounts.warning,
            },
            {
              title: t('common.statuses.processing'),
              value: moduleStatusCounts.processing,
            },
            {
              title: t('common.statuses.error'),
              value: moduleStatusCounts.error,
            },
            moduleStatusCounts.other > 0
              ? {
                  title: t('common.statuses.other'),
                  value: moduleStatusCounts.other,
                }
              : null,
          ]}
          additionalContent={
            <Button
              design="Emphasized"
              onClick={() => navigate(clusterUrl('kymamodules'))}
            >
              {t('kyma-modules.modify-modules')}
            </Button>
          }
        />
      )}
    </>
  );
}
