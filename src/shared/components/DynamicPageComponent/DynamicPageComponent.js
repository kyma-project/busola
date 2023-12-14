import PropTypes from 'prop-types';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  DynamicPage,
  DynamicPageHeader,
  DynamicPageTitle,
  Popover,
  Text,
  Title,
} from '@ui5/webcomponents-react';

import './DynamicPageComponent.scss';
import { createPortal } from 'react-dom';
import { spacing } from '@ui5/webcomponents-react-base';
import { useState } from 'react';

const Column = ({ title, children, columnSpan, image, style = {} }) => {
  const styleComputed = { gridColumn: columnSpan, ...style };
  return (
    <div className="page-header__column" style={styleComputed}>
      {image && <div className="image">{image}</div>}
      <div className="content-container">
        <div className="title bsl-has-color-status-4 ">{title}</div>
        <span className="content bsl-has-color-text-1">{children}</span>
      </div>
    </div>
  );
};

export const DynamicPageComponent = ({
  title,
  description,
  breadcrumbItems,
  actions,
  children,
  columnWrapperClassName,
  content,
}) => {
  const [showTitleDescription, setShowTitleDescription] = useState(false);

  return (
    <DynamicPage
      className="page-header"
      alwaysShowContentHeader
      showHideHeaderButton={false}
      headerContentPinnable={false}
      headerTitle={
        <DynamicPageTitle
          style={title === 'Clusters Overview' ? { display: 'none' } : null}
          breadcrumbs={
            breadcrumbItems.length ? (
              <Breadcrumbs design="NoCurrentPage">
                {breadcrumbItems.map(item => {
                  return (
                    <BreadcrumbsItem
                      aria-label="breadcrumb-item"
                      key={item.name}
                      href={item.url}
                    >
                      {item.name}
                    </BreadcrumbsItem>
                  );
                })}
              </Breadcrumbs>
            ) : null
          }
          header={
            <Title className="ui5-title">
              {title}
              {description && (
                <>
                  <Button
                    id="descriptionOpener"
                    icon="hint"
                    design="Transparent"
                    style={spacing.sapUiTinyMargin}
                    onClick={() => {
                      setShowTitleDescription(true);
                    }}
                  />
                  {createPortal(
                    <Popover
                      opener="descriptionOpener"
                      open={showTitleDescription}
                      onAfterClose={() => setShowTitleDescription(false)}
                      placementType="Right"
                    >
                      <Text className="description">{description}</Text>
                    </Popover>,
                    document.body,
                  )}
                </>
              )}
            </Title>
          }
          actions={actions}
        />
      }
      headerContent={
        title !== 'Clusters Overview' && children ? (
          <DynamicPageHeader className="header-wrapper">
            <section
              className={`column-wrapper ${columnWrapperClassName || ''}`}
            >
              {children}
            </section>
          </DynamicPageHeader>
        ) : null
      }
    >
      {content}
    </DynamicPage>
  );
};
DynamicPageComponent.Column = Column;

DynamicPageComponent.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  breadcrumbItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      path: PropTypes.string,
      params: PropTypes.object,
      fromContext: PropTypes.string,
      fromAbsolutePath: PropTypes.bool,
      onClick: PropTypes.func,
    }),
  ),
};

DynamicPageComponent.defaultProps = {
  breadcrumbItems: [],
  description: '',
};
