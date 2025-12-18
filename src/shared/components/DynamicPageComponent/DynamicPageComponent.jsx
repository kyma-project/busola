import PropTypes from 'prop-types';
import {
  DynamicPage,
  DynamicPageHeader,
  DynamicPageTitle,
  FlexBox,
  Tab,
  TabContainer,
  Title,
  Toolbar,
  ToolbarSeparator,
  ToolbarButton,
} from '@ui5/webcomponents-react';

import './DynamicPageComponent.scss';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { HintButton } from '../HintButton/HintButton';
import { isResourceEditedAtom } from 'state/resourceEditedAtom';
import { isFormOpenAtom } from 'state/formOpenAtom';
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
        <div className="title bsl-has-color-status-4 " tabIndex={0}>
          {title}:
        </div>
        <span className="content bsl-has-color-text-1" tabIndex={0}>
          {children}
        </span>
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
  isFirstColumnWithEdit = false,
}) => {
  const navigate = useNavigate();
  const [showTitleDescription, setShowTitleDescription] = useState(false);
  const [layoutColumn, setLayoutColumn] = useAtom(columnLayoutAtom);
  const { t } = useTranslation();
  const [isResourceEdited, setIsResourceEdited] = useAtom(isResourceEditedAtom);
  const [isFormOpen, setIsFormOpen] = useAtom(isFormOpenAtom);
  const { navigateSafely } = useFormNavigation();
  const [searchParams] = useSearchParams();
  const editColumn = searchParams.get('editColumn');

  const [selectedTab, setSelectedTab] = useState(
    layoutColumn?.showEdit ? 'edit' : 'view',
  );

  useEffect(() => {
    if (
      layoutColumn?.layout !== 'OneColumn' &&
      layoutNumber === 'startColumn'
    ) {
      setSelectedTab(editColumn === 'startColumn' ? 'edit' : 'view');
    } else {
      setSelectedTab(layoutColumn?.showEdit ? 'edit' : 'view');
    }
  }, [editColumn, layoutNumber, layoutColumn?.layout, layoutColumn?.showEdit]);

  const dynamicPageRef = useRef(null);
  const tabContainerRef = useRef(null);
  const { headerHeight, tabContainerHeight } = useGetHeaderHeight(
    dynamicPageRef,
    tabContainerRef,
  );

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

    const searchField = searchParams.get('search');

    if (layoutCloseUrl) {
      const showEdit = editColumn ? `showEdit=${!!layoutColumn.showEdit}&` : '';
      const showSearch = searchField ? `search=${searchField}` : '';
      const link = `${layoutCloseUrl}?${showEdit}${showSearch}`;
      navigate(link);
      return;
    }

    const linkBase = window.location.pathname.slice(
      0,
      window.location.pathname.lastIndexOf('/'),
    );
    const layoutType =
      layoutNumber === 'midColumn' || layoutColumn?.showCreate?.resourceType
        ? ''
        : 'layout=TwoColumnsMidExpanded&';
    const showSearch = searchField ? `search=${searchField}` : '';
    const link = `${linkBase}?${layoutType}${showSearch}`;
    navigate(link);
  };

  const actionsBar = (
    <Toolbar design="Transparent" toolbarStyle="Clear">
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
      {(window.location.search.includes('layout') ||
        layoutColumn?.showCreate?.resourceType) &&
      layoutColumn.layout !== 'OneColumn' &&
      layoutNumber !== 'startColumn' ? (
        <>
          {(layoutColumn.layout === 'TwoColumnsMidExpanded' ||
            ((layoutColumn.layout === 'ThreeColumnsMidExpanded' ||
              layoutColumn.layout === 'ThreeColumnsEndExpanded') &&
              layoutNumber !== 'midColumn')) && (
            <ToolbarButton
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
                const resourceNamespace = searchParams.get('resourceNamespace');
                const link = `${window.location.pathname}?layout=${newLayout}${
                  layoutColumn?.showCreate?.resourceType
                    ? '&showCreate=true'
                    : resourceNamespace
                      ? `&resourceNamespace=${resourceNamespace}`
                      : ''
                }`;
                navigate(link);
              }}
            />
          )}
          {(layoutColumn.layout === 'MidColumnFullScreen' ||
            layoutColumn.layout === 'EndColumnFullScreen') && (
            <ToolbarButton
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
                const resourceNamespace = searchParams.get('resourceNamespace');
                const link = `${window.location.pathname}?layout=${newLayout}${
                  layoutColumn?.showCreate?.resourceType
                    ? '&showCreate=true'
                    : resourceNamespace
                      ? `&resourceNamespace=${resourceNamespace}`
                      : ''
                }`;
                navigate(link);
              }}
            />
          )}
          <ToolbarButton
            accessibleName="close-column"
            design="Transparent"
            icon="decline"
            onClick={() => {
              navigateSafely(() => handleColumnClose());
            }}
          />
        </>
      ) : null}
    </Toolbar>
  );

  const headerTitle = (
    <DynamicPageTitle
      className={inlineEditForm ? 'no-shadow' : ''}
      style={title === 'Clusters Overview' ? { display: 'none' } : null}
      aria-label={title}
      heading={
        <FlexBox className="title-container" alignItems="Center">
          <Title
            level="H2"
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

  const handlePageRef = (dynamicPage) => {
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
        ref={(dynamicPage) => handlePageRef(dynamicPage)}
      >
        <TabContainer
          className="tab-container"
          style={{ top: `${headerHeight}px` }}
          ref={tabContainerRef}
          collapsed
          onTabSelect={(e) => {
            if (customActionIfFormOpen) {
              customActionIfFormOpen(
                isResourceEdited,
                setIsResourceEdited,
                isFormOpen,
                setIsFormOpen,
              );
              setSelectedTab(e.detail.tab.getAttribute('data-mode'));
              return;
            }
            if (isFormOpen.formOpen) {
              e.preventDefault();
            }

            const newTabName = e.detail.tab.getAttribute('data-mode');
            navigateSafely(() => {
              setSelectedTab(newTabName);

              const params = new URLSearchParams(window.location.search);
              let showEdit = null;

              if (newTabName === 'edit') {
                showEdit = { resource: null };

                if (layoutColumn.layout !== 'OneColumn') {
                  if (isFirstColumnWithEdit) {
                    params.set('editColumn', 'startColumn');
                    showEdit = layoutColumn?.showEdit;
                  } else {
                    params.set('editColumn', 'startColumn');
                    params.set('showEdit', 'true');
                  }
                } else {
                  params.set('showEdit', 'true');
                }
              } else {
                params.delete('showEdit');
              }

              setLayoutColumn({
                ...layoutColumn,
                showEdit,
              });
              navigate(`${window.location.pathname}?${params.toString()}`);
            });
          }}
        >
          <Tab
            data-mode="view"
            text={t('common.tabs.view')}
            selected={selectedTab === 'view'}
          ></Tab>
          <Tab
            data-mode="edit"
            text={showYamlTab ? t('common.tabs.yaml') : t('common.tabs.edit')}
            selected={selectedTab === 'edit'}
          ></Tab>
        </TabContainer>

        {selectedTab === 'view' && content}

        {selectedTab === 'edit' &&
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
      ref={(dynamicPage) => handlePageRef(dynamicPage)}
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
