import React from 'react';
import PropTypes from 'prop-types';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  DynamicPage,
  DynamicPageHeader,
  DynamicPageTitle,
  Text,
  Title,
} from '@ui5/webcomponents-react';

import './DynamicPageComponent.scss';

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
          header={<Title className="ui5-title">{title}</Title>}
          actions={actions}
        />
      }
      headerContent={
        title !== 'Clusters Overview' ? (
          <DynamicPageHeader className="header-wrapper">
            {description && <Text className="description">{description}</Text>}
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
