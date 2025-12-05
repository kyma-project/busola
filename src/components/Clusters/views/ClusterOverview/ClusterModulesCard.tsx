import { useTranslation } from 'react-i18next';
import { Button } from '@ui5/webcomponents-react';
import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import { useKymaModulesQuery } from 'components/Modules/kymaModulesQueries';
import { useUrl } from 'hooks/useUrl';
import { useNavigate } from 'react-router';
import { useGetAllModulesStatuses } from 'components/Modules/hooks';
import { useContext, useMemo } from 'react';
import { CommunityModuleContext } from 'components/Modules/community/providers/CommunityModuleProvider';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from 'state/types';
import { HttpError } from 'shared/hooks/BackendAPI/config';

const CountStatuseByType = (
  statuses: Record<string, any>,
  loadingStatuses: boolean,
  statusesError: Error | null,
) => {
  if (statuses?.length && !loadingStatuses && !statusesError) {
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
  const { installedCommunityModules, installedCommunityModulesLoading } =
    useContext(CommunityModuleContext);
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

  const { isEnabled: isCommunityModulesEnabled } = useFeature(
    configFeaturesNames.COMMUNITY_MODULES,
  );

  const display =
    (!error || (error as HttpError)?.code === 404) &&
    !loadingModules &&
    modules &&
    !installedCommunityModulesLoading;

  return (
    <>
      {display && (
        <CountingCard
          className="modules-statuses"
          value={modules?.length + installedCommunityModules?.length}
          title={t('cluster-overview.statistics.modules-overview')}
          subTitle={t('kyma-modules.installed-modules')}
          extraInfo={[
            isCommunityModulesEnabled
              ? {
                  title: t('modules.community.installed-modules'),
                  value: installedCommunityModules?.length,
                }
              : null,
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
            <Button onClick={() => navigate(clusterUrl('kymamodules'))}>
              {t('kyma-modules.modify-modules')}
            </Button>
          }
        />
      )}
    </>
  );
}
