import PropTypes from 'prop-types';
import {
  Button,
  DynamicPage,
  DynamicPageHeader,
  DynamicPageTitle,
  FlexBox,
  Tab,
  TabContainer,
  Title,
} from '@ui5/webcomponents-react';
import { Toolbar } from '@ui5/webcomponents-react-compat/dist/components/Toolbar/index.js';
import { ToolbarSpacer } from '@ui5/webcomponents-react-compat/dist/components/ToolbarSpacer/index.js';
import { ToolbarSeparator } from '@ui5/webcomponents-react-compat/dist/components/ToolbarSeparator/index.js';

import './DynamicPageComponent.scss';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { HintButton } from '../DescriptionHint/DescriptionHint';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { isFormOpenState } from 'state/formOpenAtom';
import { useNavigate, useSearchParams } from 'react-router';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';

const useGetHeaderHeight = (dynamicPageRef, tabContainerRef) => {
  const [headerHeight, setHeaderHeight] = useState(undefined);
  const [tabContainerHeight, setTabContainerHeight] = useState(undefined);

  useEffect(() => {
    const headerObserver = new ResizeObserver(([header]) => {
      setHeaderHeight(header.contentRect.height);
    });

    const tabContainerObserver = new ResizeObserver(([tabContainer]) => {
      setTabContainerHeight(tabContainer.contentRect.height);
    });

    if (dynamicPageRef.current) {
      // Wait for the custom element to be defined
      void customElements.whenDefined('ui5-dynamic-page').then(() => {
        const shadowRoot = dynamicPageRef.current?.shadowRoot;

        if (!shadowRoot) {
          return;
        }

        // Wait for the shadowRoot to be populated
        const shadowRootObserver = new MutationObserver(() => {
          const header = shadowRoot.querySelector('header');

          if (header) {
            headerObserver.observe(header);
            shadowRootObserver.disconnect();
          }
        });

        if (shadowRoot.childElementCount > 0) {
          const header = shadowRoot.querySelector('header');
          if (header) {
            headerObserver.observe(header);
          }
        } else if (shadowRoot instanceof Node) {
          shadowRootObserver.observe(shadowRoot, { childList: true });
        }
      });
    }

    if (tabContainerRef.current) {
      tabContainerObserver.observe(tabContainerRef.current);
    }

    return () => {
      headerObserver.disconnect();
      tabContainerObserver.disconnect();
    };
  }, [dynamicPageRef, tabContainerRef]);

  return { headerHeight, tabContainerHeight };
};

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
  headerContent: customHeaderContent,
  title,
  description = '',
  actions,
  children,
  columnWrapperClassName,
  content,
  footer,
  layoutNumber,
  layoutCloseUrl,
  inlineEditForm,
  showYamlTab,
  protectedResource,
  protectedResourceWarning,
  className,
  customActionIfFormOpen,
}) => {
  const navigate = useNavigate();
  const [showTitleDescription, setShowTitleDescription] = useState(false);
  const [layoutColumn, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { t } = useTranslation();
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const [isFormOpen, setIsFormOpen] = useRecoilState(isFormOpenState);
  const { navigateSafely } = useFormNavigation();
  const [searchParams] = useSearchParams();
  const showEdit = searchParams.get('showEdit');
  const editColumn = searchParams.get('editColumn');
  const currColumnInfo = layoutColumn[layoutNumber] ?? layoutColumn.startColumn;

  const [selectedSectionIdState, setSelectedSectionIdState] = useState(
    showEdit &&
      currColumnInfo?.resourceName === layoutColumn?.showEdit?.resourceName
      ? 'edit'
      : 'view',
  );

  const dynamicPageRef = useRef(null);
  const tabContainerRef = useRef(null);
  const { headerHeight, tabContainerHeight } = useGetHeaderHeight(
    dynamicPageRef,
    tabContainerRef,
  );

  useEffect(() => {
    if (showEdit) setSelectedSectionIdState('edit');
  }, [showEdit]);

  const handleColumnClose = () => {
    layoutNumber === 'midColumn'
      ? setLayoutColumn({
          ...layoutColumn,
          midColumn: null,
          layout: 'OneColumn',
          showCreate: null,
          showEdit: null,
        })
      : setLayoutColumn({
          ...layoutColumn,
          endColumn: null,
          layout: 'TwoColumnsMidExpanded',
          showCreate: null,
          showEdit: null,
        });

    if (layoutCloseUrl) {
      navigate(layoutCloseUrl + (editColumn ? `?showEdit=${showEdit}` : ''));
      return;
    }

    const link = `${window.location.pathname.slice(
      0,
      window.location.pathname.lastIndexOf('/'),
    )}${
      layoutNumber === 'midColumn' || layoutColumn?.showCreate?.resourceType
        ? ''
        : '?layout=TwoColumnsMidExpanded'
    }`;
    navigate(link);
  };

  const actionsBar = (
    <Toolbar
      design="Transparent"
      toolbarStyle="Clear"
      numberOfAlwaysVisibleItems={1}
    >
      <ToolbarSpacer />
      {actions && (
        <>
          {actions}
          {(window.location.search.includes('layout') ||
            (!window.location.search.includes('layout') &&
              layoutColumn?.showCreate?.resourceType)) &&
          layoutNumber !== 'startColumn' ? (
            <ToolbarSeparator />
          ) : null}
        </>
      )}
      {window.location.search.includes('layout') ||
      (!window.location.search.includes('layout') &&
        layoutColumn?.showCreate?.resourceType) ? (
        layoutColumn.layout !== 'OneColumn' ? (
          layoutNumber !== 'startColumn' ? (
            <>
              {layoutColumn.layout === 'TwoColumnsMidExpanded' ||
              ((layoutColumn.layout === 'ThreeColumnsMidExpanded' ||
                layoutColumn.layout === 'ThreeColumnsEndExpanded') &&
                layoutNumber !== 'midColumn') ? (
                <Button
                  accessibleName="enter-full-screen"
                  design="Transparent"
                  icon="full-screen"
                  onClick={() => {
                    const newLayout =
                      layoutNumber === 'midColumn'
                        ? 'MidColumnFullScreen'
                        : 'EndColumnFullScreen';
                    setLayoutColumn({
                      ...layoutColumn,
                      layout: newLayout,
                    });
                    const link = `${window.location.pathname}${
                      layoutColumn?.showCreate?.resourceType
                        ? '?layout=' + newLayout + '&showCreate=true'
                        : '?layout=' + newLayout
                    }`;
                    navigate(link);
                  }}
                />
              ) : null}
              {layoutColumn.layout === 'MidColumnFullScreen' ||
              layoutColumn.layout === 'EndColumnFullScreen' ? (
                <Button
                  accessibleName="close-full-screen"
                  design="Transparent"
                  icon="exit-full-screen"
                  onClick={() => {
                    const newLayout =
                      layoutNumber === 'midColumn'
                        ? layoutColumn.endColumn === null
                          ? 'TwoColumnsMidExpanded'
                          : 'ThreeColumnsMidExpanded'
                        : 'ThreeColumnsEndExpanded';
                    setLayoutColumn({
                      ...layoutColumn,
                      layout: newLayout,
                    });
                    const link = `${window.location.pathname}${
                      layoutColumn?.showCreate?.resourceType
                        ? '?layout=' + newLayout + '&showCreate=true'
                        : '?layout=' + newLayout
                    }`;
                    navigate(link);
                  }}
                />
              ) : null}
              <Button
                accessibleName="close-column"
                design="Transparent"
                icon="decline"
                onClick={() => {
                  navigateSafely(() => handleColumnClose());
                }}
              />
            </>
          ) : null
        ) : null
      ) : null}
    </Toolbar>
  );

  const headerTitle = (
    <DynamicPageTitle
      className={inlineEditForm ? 'no-shadow' : ''}
      style={title === 'Clusters Overview' ? { display: 'none' } : null}
      heading={
        <FlexBox className="title-container" alignItems="Center">
          <Title
            level="H3"
            size="H3"
            className="bold-title"
            wrappingType="None"
          >
            {title}
          </Title>
          {protectedResource && (
            <span className="sap-margin-begin-tiny">
              {protectedResourceWarning}
            </span>
          )}
          {description && (
            <HintButton
              className="sap-margin-tiny"
              setShowTitleDescription={setShowTitleDescription}
              showTitleDescription={showTitleDescription}
              description={description}
              ariaTitle={title}
            />
          )}
        </FlexBox>
      }
      actionsBar={actionsBar}
    />
  );

  const headerContent =
    title !== 'Clusters Overview' && children ? (
      <DynamicPageHeader className="header-wrapper">
        <section className={`column-wrapper ${columnWrapperClassName || ''}`}>
          {children}
        </section>
      </DynamicPageHeader>
    ) : null;

  const handlePageRef = dynamicPage => {
    if (dynamicPageRef) {
      if (typeof dynamicPageRef === 'function') {
        dynamicPageRef(dynamicPage);
      } else if (dynamicPageRef.current !== undefined) {
        dynamicPageRef.current = dynamicPage;
      }
    }

    const button = dynamicPage?.shadowRoot?.querySelector(
      'ui5-dynamic-page-header-actions',
    );
    if (button) {
      button.style['display'] = 'none';
    }
  };

  if (inlineEditForm) {
    return (
      <DynamicPage
        mode="IconTabBar"
        className={`page-header ${className ?? ''}`}
        headerPinned
        hidePinButton={true}
        titleArea={headerTitle}
        headerArea={customHeaderContent ?? headerContent}
        ref={dynamicPage => handlePageRef(dynamicPage)}
      >
        <TabContainer
          className="tab-container"
          style={{ top: `${headerHeight}px` }}
          ref={tabContainerRef}
          collapsed
          onTabSelect={e => {
            if (customActionIfFormOpen) {
              customActionIfFormOpen(
                isResourceEdited,
                setIsResourceEdited,
                isFormOpen,
                setIsFormOpen,
              );
              setSelectedSectionIdState(e.detail.tab.getAttribute('data-mode'));
              return;
            }
            if (isFormOpen.formOpen) {
              e.preventDefault();
            }
            if (
              showEdit &&
              currColumnInfo?.resourceName !==
                layoutColumn?.showEdit?.resourceName
            ) {
              return;
            }

            const newTabName = e.detail.tab.getAttribute('data-mode');
            navigateSafely(() => {
              setSelectedSectionIdState(newTabName);

              if (newTabName === 'edit') {
                const params = new URLSearchParams();
                if (layoutColumn.layout !== 'OneColumn') {
                  params.set('layout', layoutColumn.layout);
                  if (title === 'Modules') {
                    params.set('editColumn', 'startColumn');
                  }
                }
                params.set('showEdit', 'true');

                setLayoutColumn({
                  ...layoutColumn,
                  showEdit: {
                    ...currColumnInfo,
                    resource: null,
                  },
                });
                navigate(`${window.location.pathname}?${params.toString()}`);
              } else {
                setLayoutColumn({
                  ...layoutColumn,
                  showEdit: null,
                });
                navigate(
                  `${window.location.pathname}${
                    layoutColumn.layout === 'OneColumn'
                      ? ''
                      : '?layout=' + layoutColumn.layout
                  }`,
                );
              }
            });
          }}
        >
          <Tab
            data-mode="view"
            text={t('common.tabs.view')}
            selected={selectedSectionIdState === 'view'}
          ></Tab>
          <Tab
            data-mode="edit"
            text={showYamlTab ? t('common.tabs.yaml') : t('common.tabs.edit')}
            selected={selectedSectionIdState === 'edit'}
          ></Tab>
        </TabContainer>

        {selectedSectionIdState === 'view' && content}

        {selectedSectionIdState === 'edit' &&
          inlineEditForm(headerHeight + tabContainerHeight)}
      </DynamicPage>
    );
  }

  return (
    <DynamicPage
      className="page-header"
      hidePinButton
      titleArea={headerTitle}
      headerArea={headerContent}
      footerArea={footer}
      ref={dynamicPage => handlePageRef(dynamicPage)}
    >
      {typeof content === 'function' ? content(headerHeight) : content}
    </DynamicPage>
  );
};
DynamicPageComponent.Column = Column;

DynamicPageComponent.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
};
