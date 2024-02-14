import PropTypes from 'prop-types';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  DynamicPage,
  DynamicPageHeader,
  DynamicPageTitle,
  Title,
} from '@ui5/webcomponents-react';

import './DynamicPageComponent.scss';
import { spacing } from '@ui5/webcomponents-react-base';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useFeature } from 'hooks/useFeature';
import { HintButton } from '../DescriptionHint/DescriptionHint';

const Column = ({ title, children, columnSpan, image, style = {} }) => {
  const styleComputed = { gridColumn: columnSpan, ...style };
  return (
    <div className="page-header__column" style={styleComputed}>
      {image && <div className="image">{image}</div>}
      <div className="content-container">
        <div className="title bsl-has-color-status-4 ">{title}:</div>
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
  layoutNumber,
  layoutCloseUrl,
}) => {
  const [showTitleDescription, setShowTitleDescription] = useState(false);
  const [layoutColumn, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { isEnabled: isColumnLayoutEnabled } = useFeature('COLUMN_LAYOUT');
  return (
    <DynamicPage
      className="page-header"
      alwaysShowContentHeader
      showHideHeaderButton={false}
      headerContentPinnable={false}
      backgroundDesign="Transparent"
      headerTitle={
        <DynamicPageTitle
          navigationActions={
            window.location.search.includes('layout') &&
            isColumnLayoutEnabled ? (
              layoutColumn.layout !== 'OneColumn' ? (
                layoutNumber !== 'StartColumn' ? (
                  <>
                    {layoutColumn.layout === 'TwoColumnsMidExpanded' ||
                    ((layoutColumn.layout === 'ThreeColumnsMidExpanded' ||
                      layoutColumn.layout === 'ThreeColumnsEndExpanded') &&
                      layoutNumber !== 'MidColumn') ? (
                      <Button
                        aria-label="full-screen"
                        design="Transparent"
                        icon="full-screen"
                        onClick={() => {
                          const newLayout =
                            layoutNumber === 'MidColumn'
                              ? 'MidColumnFullScreen'
                              : 'EndColumnFullScreen';
                          setLayoutColumn({
                            ...layoutColumn,
                            layout: newLayout,
                          });
                          window.history.pushState(
                            window.history.state,
                            '',
                            `${window.location.pathname}?layout=${newLayout}`,
                          );
                        }}
                      />
                    ) : null}
                    {layoutColumn.layout === 'MidColumnFullScreen' ||
                    layoutColumn.layout === 'EndColumnFullScreen' ? (
                      <Button
                        aria-label="close-full-screen"
                        design="Transparent"
                        icon="exit-full-screen"
                        onClick={() => {
                          const newLayout =
                            layoutNumber === 'MidColumn'
                              ? layoutColumn.endColumn === null
                                ? 'TwoColumnsMidExpanded'
                                : 'ThreeColumnsMidExpanded'
                              : 'ThreeColumnsEndExpanded';
                          setLayoutColumn({
                            ...layoutColumn,
                            layout: newLayout,
                          });
                          window.history.pushState(
                            window.history.state,
                            '',
                            `${window.location.pathname}?layout=${newLayout}`,
                          );
                        }}
                      />
                    ) : null}
                    <Button
                      aria-label="close-column"
                      design="Transparent"
                      icon="decline"
                      onClick={() => {
                        window.history.pushState(
                          window.history.state,
                          '',
                          layoutCloseUrl
                            ? layoutCloseUrl
                            : `${window.location.pathname.slice(
                                0,
                                window.location.pathname.lastIndexOf('/'),
                              )}${
                                layoutNumber === 'MidColumn'
                                  ? ''
                                  : '?layout=TwoColumnsMidExpanded'
                              }`,
                        );
                        setLayoutColumn({
                          ...layoutColumn,
                          layout:
                            layoutNumber === 'MidColumn'
                              ? 'OneColumn'
                              : 'TwoColumnsMidExpanded',
                        });
                      }}
                    />
                  </>
                ) : null
              ) : null
            ) : null
          }
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
                <HintButton
                  style={spacing.sapUiTinyMargin}
                  setShowTitleDescription={setShowTitleDescription}
                  showTitleDescription={showTitleDescription}
                  description={description}
                />
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
