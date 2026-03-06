import { useTranslation } from 'react-i18next';
import { Button } from '@ui5/webcomponents-react';
import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import { useKymaModulesQuery } from 'components/Modules/kymaModulesQueries';
import { useUrl } from 'hooks/useUrl';
import { useNavigate } from 'react-router';
import { useContext, useMemo } from 'react';
import { CommunityModuleContext } from 'components/Modules/community/providers/CommunityModuleProvider';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from 'state/types';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { KymaResourceStatusModuleType } from 'components/Modules/support';

function countStatusesByType(modules: KymaResourceStatusModuleType[]) {
  const counts = { ready: 0, error: 0, warning: 0, processing: 0, other: 0 };
  for (const m of modules) {
    const state = m?.state;
    if (state === 'Ready') counts.ready++;
    else if (state === 'Error') counts.error++;
    else if (state === 'Warning') counts.warning++;
    else if (state === 'Processing') counts.processing++;
    else counts.other++;
  }
  return counts;
}

export default function ClusterModulesCard() {
  const { t } = useTranslation();
  const { installedCommunityModules, installedCommunityModulesLoading } =
    useContext(CommunityModuleContext);
  const { modules, error, loading: loadingModules } = useKymaModulesQuery();
  const { clusterUrl } = useUrl();
  const navigate = useNavigate();

  const moduleStatusCounts = useMemo(() => {
    return countStatusesByType(modules ?? []);
  }, [modules]);

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
