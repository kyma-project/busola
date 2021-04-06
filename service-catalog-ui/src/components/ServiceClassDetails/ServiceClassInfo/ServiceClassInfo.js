import React from 'react';
import PropTypes from 'prop-types';
import { Tile, Icon } from 'fundamental-react';
import { ReadableCreationTimestamp } from 'react-shared';
import {
  ServiceClassInfoContentWrapper,
  ExternalLink,
  Image,
  ServiceClassHeaderTileGrid,
} from './styled';

import { serviceClassTileTitles } from 'helpers/constants';
import { isStringValueEqualToTrue } from 'helpers';
import { Token } from 'fundamental-react/Token';

const ServiceClassInfo = ({ serviceClass, labels, planSelector }) => {
  const extData = serviceClass.spec.externalMetadata || {};

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

  const tagsCombined = [...(serviceClass.spec.tags || []), ...extractLabels()];
  const COLUMN_COUNT = 4;

  return (
    <ServiceClassInfoContentWrapper className="fd-has-padding-top-none">
      <ServiceClassHeaderTileGrid
        style={{
          gridTemplateColumns: `repeat(${COLUMN_COUNT} ,1fr)`,
        }}
      >
        <Tile>
          <Tile.Media className="fd-has-display-flex">
            {extData.imageUrl ? (
              <Image size="l" photo={extData.imageUrl} />
            ) : (
              <Icon glyph="crm-service-manager" />
            )}
          </Tile.Media>
          <Tile.Content title={serviceClassTileTitles.creator}>
            <p>{extData.providerDisplayName}</p>
          </Tile.Content>
        </Tile>
        <Tile>
          <Tile.Content title={serviceClassTileTitles.lastUpdate}>
            <ReadableCreationTimestamp
              timestamp={serviceClass.metadata.creationTimestamp}
            />
          </Tile.Content>
        </Tile>
        {extData.documentationUrl && (
          <Tile>
            <Tile.Content title={serviceClassTileTitles.documentation}>
              <ExternalLink
                href={extData.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Link
              </ExternalLink>
            </Tile.Content>
          </Tile>
        )}
        {extData.supportUrl && (
          <Tile>
            <Tile.Content title={serviceClassTileTitles.support}>
              <ExternalLink
                href={extData.supportUrl}
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
            <p data-e2e-id="service-description">
              {serviceClass.spec.description}
            </p>
          </Tile.Content>
        </Tile>
        {tagsCombined && tagsCombined.length > 0 && (
          <Tile
            style={{
              gridColumn: `span ${COLUMN_COUNT - (planSelector ? 2 : 0)}`,
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
  serviceClass: PropTypes.object.isRequired,
  labels: PropTypes.object,
  planSelector: PropTypes.node,
};

export default ServiceClassInfo;
