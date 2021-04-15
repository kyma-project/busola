import React from 'react';
import PropTypes from 'prop-types';
import './Card.scss';
import { Tooltip } from 'react-shared';
import { Icon, LayoutPanel } from 'fundamental-react';
import { InstancesIndicator } from './InstancesIndicator';
import { Labels } from './Labels';
import {
  CardWrapper,
  CardContent,
  CardTop,
  CardHeaderContent,
  CardThumbnail,
  CardImage,
  CardDescription,
} from './styled';
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
  <CardWrapper data-e2e-id="card" className="card">
    <CardContent onClick={onClick} data-e2e-id={`go-to-details`}>
      <CardTop>
        <div className="card__header fd-tile">
          <CardThumbnail>
            {imageUrl ? (
              <CardImage size="s" photo={imageUrl} />
            ) : (
              <Icon glyph="crm-service-manager" style={{ color: '#515559' }} />
            )}
          </CardThumbnail>

          <CardHeaderContent
            aria-label={`go to service class ${title} link`}
            data-e2e-id="card-title"
            title={title}
          >
            <span data-e2e-id="card-company">{company}</span>
          </CardHeaderContent>
          <LayoutPanel.Actions>
            {labels && labels[DOCUMENTATION_PER_PLAN_LABEL] === 'true' && (
              <div aria-label="has-API-packages-indicator" className="icon">
                <Tooltip content={DOCUMENTATION_PER_PLAN_DESCRIPTION}>
                  <Icon glyph="sap-box" size="l" />
                </Tooltip>
              </div>
            )}
            <InstancesIndicator
              numberOfInstances={numberOfInstances}
              labels={labels}
            />
          </LayoutPanel.Actions>
        </div>
      </CardTop>

      <CardDescription>{description}</CardDescription>
      <Labels labels={labels} ignoredLabels={[DOCUMENTATION_PER_PLAN_LABEL]} />
    </CardContent>
  </CardWrapper>
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
