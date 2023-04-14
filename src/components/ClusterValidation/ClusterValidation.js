import { PageHeader } from 'shared/components/PageHeader/PageHeader';

import { useTranslation } from 'react-i18next';
import { FilteredResourcesDetails } from 'resources/Namespaces/YamlUpload/FilteredResourcesDetails/FilteredResourcesDetails';
import { useEffect, useState } from 'react';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { loadResources } from './ResourceLoader';

async function fetchResources(fetch) {
  // const response = await fetch({relativeUrl: `/apis/apps/v1/namespaces/jv/deployments?limit=500`});
  const response = await fetch({
    relativeUrl: `/api/v1/namespaces/jv/pods?limit=500`,
  });
  const data = await response.json();
  return data.items;
}

function ClusterValidation() {
  const { t } = useTranslation();

  const [resources, setResources] = useState([]);

  const currentResources = [];

  const fetch = useFetch();
  useEffect(() => {
    console.log('fetching');
    const _load = async () => {
      for await (const rs of loadResources(relativeUrl =>
        fetch({ relativeUrl }),
      )) {
        currentResources.push(
          ...rs.items.map(r => ({ value: { kind: rs.kind, ...r } })),
        );
      }
      console.log(currentResources);
      setResources(currentResources);
    };
    _load();

    return () => {
      // cancel loading
    };

    // fetchResources(fetch).then(r => {
    //   console.log(r);
    //   setResources(r.map(resource => ({value: {kind: 'Pod', ...resource}})));
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeader title={t('clusters.overview.title-all-clusters')} />
      <FilteredResourcesDetails filteredResources={resources} />
    </>
  );
}

export default ClusterValidation;
