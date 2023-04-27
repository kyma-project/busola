import { PageHeader } from 'shared/components/PageHeader/PageHeader';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { loadResources, loadResourcesConcurrently } from './ResourceLoader';
import { useRecoilValue } from 'recoil';
import { validationSchemasEnabledState } from 'state/validationEnabledSchemasAtom';
import { ResourceValidation } from './ResourceValidation';
import { ResourceWarningList, ValidationWarnings } from './ValidationWarnings';
import { Button, LayoutPanel, Tile } from 'fundamental-react';

import './ClusterValidation.scss';

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
  const validationSchemas = useRecoilValue(validationSchemasEnabledState);

  const [resources, setResources] = useState([]);

  const currentResources = [];

  const fetch = useFetch();

  const scan = async () => {
    await ResourceValidation.setRuleset(validationSchemas);

    const existingResourcesString = localStorage.getItem(
      'cached-resources-for-test',
    );
    if (existingResourcesString) {
      const existingResources = JSON.parse(existingResourcesString);
      setResources(existingResources);
      currentResources.push(...existingResources);
      return;
    }

    for await (const rs of loadResourcesConcurrently(relativeUrl =>
      fetch({ relativeUrl }),
    )) {
      const newResources = rs.items.map(r => ({
        value: { kind: rs.kind, ...r },
      }));
      currentResources.push(...newResources);
      const warningsPerResource = await ResourceValidation.validate(
        newResources,
      );
      warningsPerResource.forEach((warnings, i) => {
        newResources[i].warnings = warnings;
      });
      setResources([...currentResources]);
    }
    console.log(currentResources);
    setResources([...currentResources]);
    localStorage.setItem(
      'cached-resources-for-test',
      JSON.stringify(currentResources),
    );
  };

  const clear = () => {
    localStorage.removeItem('cached-resources-for-test');
    setResources([]);
    currentResources.length = 0;
  };

  // fetchResources(fetch).then(r => {
  //   console.log(r);
  //   setResources(r.map(resource => ({value: {kind: 'Pod', ...resource}})));
  // });

  return (
    <>
      <PageHeader title={t('clusters.overview.title-all-clusters')} />
      {/* <FilteredResourcesDetails filteredResources={resources} /> */}
      <LayoutPanel>
        <LayoutPanel.Header>
          <LayoutPanel.Head
            description="description"
            title="Cluster Validation"
          />
          <LayoutPanel.Actions>
            <Button glyph="play" onClick={scan}>
              Scan
            </Button>
            <Button glyph="reset" onClick={clear}>
              Clear
            </Button>
          </LayoutPanel.Actions>
        </LayoutPanel.Header>
        <LayoutPanel.Filters>
          <div style={{ display: 'flex' }}>
            <InfoTile title="Resource Number" content={resources.length} />
            <InfoTile title="Resource Number" content={resources.length} />
          </div>
        </LayoutPanel.Filters>
        <LayoutPanel.Body>
          <ResourceWarningList resources={resources} />
        </LayoutPanel.Body>
      </LayoutPanel>
    </>
  );
}

const InfoTile = ({ title, content }) => {
  return (
    <Tile className="no-min-height" size="s">
      <Tile.Header className="no-min-height">{title}</Tile.Header>
      <Tile.Content className="no-min-height">{content}</Tile.Content>
    </Tile>
  );
};

export default ClusterValidation;
