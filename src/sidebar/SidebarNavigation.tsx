import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  SideNavigation,
  SideNavigationItem,
  ComboBox,
  Label,
  FlexBox,
} from '@ui5/webcomponents-react';
import { sidebarNavigationNodesAtom } from 'state/navigation/sidebarNavigationNodesAtom';
import { expandedCategoriesAtom } from 'state/navigation/expandedCategories/expandedCategoriesAtom';
import { CategoryItem } from './CategoryItem';
import { NavItem } from './NavItem';
import { isSidebarCondensedAtom } from 'state/settings/isSidebarCondensedAtom';
import { NamespaceDropdown } from 'header/NamespaceDropdown/NamespaceDropdown';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { columnLayoutAtom } from 'state/columnLayoutAtom';

import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router';
import { useUrl } from 'hooks/useUrl';
import { NamespaceChooser } from 'header/NamespaceChooser/NamespaceChooser';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';
import { useRef } from 'react';

export function SidebarNavigation() {
  const navigationNodes = useAtomValue(sidebarNavigationNodesAtom);
  const isSidebarCondensed = useAtomValue(isSidebarCondensedAtom);
  const namespace = useAtomValue(activeNamespaceIdAtom);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigateSafely } = useFormNavigation();
  const setLayoutColumn = useSetAtom(columnLayoutAtom);
  const sidebarRef = useRef(null);

  const { clusterUrl, namespaceUrl } = useUrl();
  const { resourceType = '' } =
    useMatch({
      path: '/cluster/:cluster/namespaces/:namespace/:resourceType',
      end: false,
    })?.params ?? {};

  const getNamespaceLabel = () => {
    if (namespace === '-all-') return t('navigation.all-namespaces');
    else return namespace || t('navigation.select-namespace');
  };

  const [expandedCategories, setExpandedCategories] = useAtom(
    expandedCategoriesAtom,
  );

  const filteredNavigationNodes =
    navigationNodes.filter((nn) => nn.items?.length > 0) || [];
  const topLevelNodes = filteredNavigationNodes?.filter(
    (nn) => nn.topLevelNode,
  );
  const categoryNodes = filteredNavigationNodes?.filter(
    (nn) => !nn.topLevelNode,
  );

  const isClusterOverviewSelected = () => {
    const { pathname } = window.location;
    if (pathname.includes('overview') && !pathname.includes('namespaces'))
      return true;
    else return false;
  };

  const setDefaultColumnLayout = () => {
    setLayoutColumn({
      startColumn: {
        resourceType: 'Cluster',
        rawResourceTypeName: 'Cluster',
        resourceName: null,
        namespaceId: null,
        apiGroup: null,
        apiVersion: null,
      },
      midColumn: null,
      endColumn: null,
      layout: 'OneColumn',
    });
  };

  return (
    <SideNavigation
      collapsed={isSidebarCondensed}
      onSelectionChange={(e) => e.preventDefault()}
      style={{
        width: isSidebarCondensed
          ? 'var(--_ui5_side_navigation_collapsed_width)'
          : '',
      }}
      ref={sidebarRef}
      header={
        <>
          {namespace && (
            <SideNavigation
              style={{
                height: 'auto',
                width: 'auto',
                boxShadow: 'none',
                marginTop: '0.5rem',
              }}
            >
              <SideNavigationItem
                icon="slim-arrow-left"
                text={t('navigation.back-to-cluster')}
                onClick={() => {
                  navigateSafely(() => {
                    setDefaultColumnLayout();
                    return navigate(clusterUrl(`overview`));
                  });
                }}
                selected={isClusterOverviewSelected()}
              />
            </SideNavigation>
          )}
          {(!namespace || isSidebarCondensed) && <div className="space-top" />}
          {namespace && (
            <div className="namespace-combobox">
              <Label
                for="NamespaceComboBox"
                className="sap-margin-bottom-tiny sap-margin-begin-small"
              >
                {t('common.headers.namespaces')}
              </Label>
              <FlexBox
                alignItems="Center"
                className="sap-margin-bottom-small sap-margin-x-tiny"
              >
                <ComboBox
                  id="NamespaceComboBox"
                  className="combobox-with-dimension-icon"
                  onSelectionChange={(e) => {
                    navigateSafely(() => {
                      const newNamespace =
                        e.target.value === t('navigation.all-namespaces')
                          ? '-all-'
                          : e.target.value;
                      setLayoutColumn((prevState) => ({
                        startColumn: {
                          resourceType:
                            prevState.startColumn?.resourceType ?? null,
                          rawResourceTypeName:
                            prevState.startColumn?.resourceType ?? null,
                          resourceName:
                            prevState.startColumn?.resourceType === 'Namespaces'
                              ? newNamespace
                              : (prevState.startColumn?.resourceName ?? null),
                          apiGroup: prevState.startColumn?.apiGroup ?? null,
                          apiVersion: prevState.startColumn?.apiVersion ?? null,
                          namespaceId: newNamespace,
                        },
                        midColumn: null,
                        endColumn: null,
                        layout: 'OneColumn',
                      }));
                      return navigate(
                        namespaceUrl(resourceType, {
                          namespace: newNamespace,
                        }),
                      );
                    });
                  }}
                  value={getNamespaceLabel()}
                >
                  <NamespaceDropdown />
                </ComboBox>
              </FlexBox>
            </div>
          )}
        </>
      }
    >
      {isSidebarCondensed && (
        <>
          <SideNavigationItem
            aria-hidden
            className="space-top disable-effects"
          />
          <SideNavigationItem
            icon={namespace ? 'slim-arrow-left' : 'bbyd-dashboard'}
            text={
              namespace
                ? t('navigation.back-to-cluster')
                : t('cluster-overview.headers.cluster-overview')
            }
            onClick={() => {
              navigateSafely(() => navigate(clusterUrl(`overview`)));
            }}
            selected={isClusterOverviewSelected()}
          />
          {namespace && (
            <SideNavigationItem
              icon="dimension"
              text={t('common.headers.namespaces')}
              selected={false}
            >
              <NamespaceChooser />
            </SideNavigationItem>
          )}
        </>
      )}
      {!namespace && !isSidebarCondensed && (
        <SideNavigationItem
          icon="bbyd-dashboard"
          text={t('cluster-overview.headers.cluster-overview')}
          onClick={() => {
            navigateSafely(() => {
              setDefaultColumnLayout();
              return navigate(clusterUrl(`overview`));
            });
          }}
          selected={isClusterOverviewSelected()}
        />
      )}
      {topLevelNodes.map((node) =>
        node.items?.map((item, index) => (
          <NavItem node={item} key={index} sidebarRef={sidebarRef} />
        )),
      )}
      {categoryNodes.map((category, index) => (
        <CategoryItem
          category={category}
          key={index}
          expandedCategories={expandedCategories}
          handleExpandedCategories={setExpandedCategories}
          sidebarRef={sidebarRef}
        />
      ))}
    </SideNavigation>
  );
}
