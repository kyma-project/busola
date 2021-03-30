import React from 'react';
import PropTypes from 'prop-types';
import { Label } from '@kyma-project/react-components';
import { Tile, Icon } from 'fundamental-react';

import { ReadableCreationTimestamp } from 'react-shared';
import {
  ServiceClassInfoContentWrapper,
  ExternalLink,
  Image,
  LabelsWrapper,
  LabelWrapper,
  ServiceClassHeaderTileGrid,
} from './styled';

import { serviceClassTileTitles } from 'helpers/constants';
import { isStringValueEqualToTrue } from 'helpers';
import { Token } from 'fundamental-react/Token';
const ServiceClassInfo = ({
  creationTimestamp,
  documentationUrl,
  supportUrl,
  imageUrl,
  tags,
  labels,
  description,
  providerDisplayName,
  planSelector,
}) => {
  function sortTags(tag1, tag2) {
    return tag1.length > 8 && tag2.length < 15;
  }

  const extractLabels = () => {
    const extractedLabels = [];
    if (labels) {
      if (labels['connected-app'])
        extractedLabels.push(labels['connected-app']);
      if (isStringValueEqualToTrue(labels.local)) extractedLabels.push('local');
      if (isStringValueEqualToTrue(labels.showcase))
        extractedLabels.push('showcase');
    }

    return extractedLabels;
  };

  console.log('modified tags', tags, extractLabels());
  const tagsCombined = [...tags, ...extractLabels()];

  const tagsDescription = {
    basic: 'Basic filter',
    'connected-app': 'Connected application',
    provisionOnlyOnce: 'Provision only once',
    tag: 'Tag',
  };

  const columnCount = 4;

  return (
    <ServiceClassInfoContentWrapper className="fd-has-padding-top-none">
      <ServiceClassHeaderTileGrid
        style={{
          gridTemplateColumns: `repeat(${columnCount} ,1fr)`,
        }}
      >
        <Tile>
          <Tile.Media className="fd-has-display-flex">
            {imageUrl ? (
              <Image size="l" photo={imageUrl} />
            ) : (
              <Icon glyph="crm-service-manager" />
            )}
          </Tile.Media>
          <Tile.Content title={serviceClassTileTitles.creator}>
            <p>{providerDisplayName}</p>
          </Tile.Content>
        </Tile>
        <Tile>
          <Tile.Content title={serviceClassTileTitles.lastUpdate}>
            <ReadableCreationTimestamp timestamp={creationTimestamp} />
          </Tile.Content>
        </Tile>
        {documentationUrl && (
          <Tile>
            <Tile.Content title={serviceClassTileTitles.documentation}>
              <ExternalLink
                href={documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Link
              </ExternalLink>
            </Tile.Content>
          </Tile>
        )}
        {supportUrl && (
          <Tile>
            <Tile.Content title={serviceClassTileTitles.support}>
              <ExternalLink
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Link
              </ExternalLink>
            </Tile.Content>
          </Tile>
        )}
        <Tile className="fd-has-grid-column-span-4">
          <Tile.Content title={serviceClassTileTitles.description}>
            <p data-e2e-id="service-description">{description}</p>
          </Tile.Content>
        </Tile>
        {tagsCombined && tagsCombined.length > 0 && (
          <Tile
            style={{
              gridColumn: `span ${columnCount - (planSelector ? 2 : 0)}`,
            }}
          >
            <Tile.Content title={serviceClassTileTitles.tags}>
              {tagsCombined.map(t => (
                <Token
                  style={{ marginTop: '4px', marginBottom: '4px' }}
                  className="y-fd-token y-fd-token--no-button y-fd-token--gap"
                  key={t}
                >
                  {t}
                </Token>
              ))}
            </Tile.Content>
          </Tile>
        )}
        {planSelector && (
          <Tile className="fd-has-grid-column-span-2">
            <Tile.Content title={serviceClassTileTitles.plans}>
              {planSelector}
            </Tile.Content>
          </Tile>
        )}
      </ServiceClassHeaderTileGrid>
    </ServiceClassInfoContentWrapper>
  );
};

ServiceClassInfo.propTypes = {
  creationTimestamp: PropTypes.string.isRequired,
  documentationUrl: PropTypes.string,
  imageUrl: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  labels: PropTypes.object,
  description: PropTypes.string,
};

export default ServiceClassInfo;
