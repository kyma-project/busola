import React from 'react';
import PropTypes from 'prop-types';
import './Card.scss';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Icon, LayoutPanel, Tile, Title } from 'fundamental-react';
import { InstancesIndicator } from './InstancesIndicator';
import { Labels } from './Labels';
import { CardThumbnail, CardImage } from './styled';
import {
  DOCUMENTATION_PER_PLAN_LABEL,
  DOCUMENTATION_PER_PLAN_DESCRIPTION,
} from 'helpers/constants';

const Card = ({
  title,
  company,
  description,
  imageUrl,
  numberOfInstances = 0,
  labels,
  onClick,
}) => (
  <Tile data-e2e-id="card" onClick={onClick} className="card">
    <div className="card__header ">
      <CardThumbnail>
        {imageUrl ? (
          <CardImage
            size="s"
            src={imageUrl}
            onError={e => {
              e.target.src = '';
            }}
          />
        ) : (
          <Icon
            glyph="crm-service-manager"
            ariaLabel="ServiceClass icon"
            style={{ color: '#515559' }}
          />
        )}
      </CardThumbnail>

      <div>
        <Title
          className="title"
          level={3}
          aria-label={`go to service class ${title} link`}
          data-e2e-id="card-title"
        >
          {title}
        </Title>
        <span data-e2e-id="card-company">{company}</span>
      </div>
      <LayoutPanel.Actions>
        {labels && labels[DOCUMENTATION_PER_PLAN_LABEL] === 'true' && (
          <div aria-label="has-API-packages-indicator" className="icon">
            <Tooltip content={DOCUMENTATION_PER_PLAN_DESCRIPTION}>
              <Icon
                glyph="sap-box"
                size="l"
                ariaLabel="Documentation per plan"
              />
            </Tooltip>
          </div>
        )}
        <InstancesIndicator
          numberOfInstances={numberOfInstances}
          labels={labels}
        />
      </LayoutPanel.Actions>
    </div>

    <p className="card__description">{description}</p>
    <Labels labels={labels} ignoredLabels={[DOCUMENTATION_PER_PLAN_LABEL]} />
  </Tile>
);

Card.propTypes = {
  title: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  imageUrl: PropTypes.string,
  labels: PropTypes.object,
};

export default Card;
