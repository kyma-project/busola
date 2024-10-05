import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  SideNavigation,
  SideNavigationItem,
  ComboBox,
  Label,
  FlexBox,
} from '@ui5/webcomponents-react';
import { sidebarNavigationNodesSelector } from 'state/navigation/sidebarNavigationNodesSelector';
import { expandedCategoriesSelector } from 'state/navigation/expandedCategories/expandedCategoriesSelector';
import { CategoryItem } from './CategoryItem';
import { NavItem } from './NavItem';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';
import { NamespaceDropdown } from 'src/header/NamespaceDropdown/NamespaceDropdown';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { columnLayoutState } from 'state/columnLayoutAtom';

import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router';
import { useUrl } from 'hooks/useUrl';
import { spacing } from '@ui5/webcomponents-react-base';
import { NamespaceChooser } from 'src/header/NamespaceChooser/NamespaceChooser';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { isFormOpenState } from 'state/formOpenAtom';
import { handleActionIfFormOpen } from 'shared/components/UnsavedMessageBox/helpers';

export function SidebarNavigation() {
  const navigationNodes = useRecoilValue(sidebarNavigationNodesSelector);
  const isSidebarCondensed = useRecoilValue(isSidebarCondensedState);
  const namespace = useRecoilValue(activeNamespaceIdState);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setLayoutColumn = useSetRecoilState(columnLayoutState);
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const [isFormOpen, setIsFormOpen] = useRecoilState(isFormOpenState);

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

  // if it's in the CategoryItem, it causes needless re-renders
  const [expandedCategories, setExpandedCategories] = useRecoilState(
    expandedCategoriesSelector,
  );

  const filteredNavigationNodes =
    navigationNodes.filter(nn => nn.items?.length > 0) || [];
  const topLevelNodes = filteredNavigationNodes?.filter(nn => nn.topLevelNode);
  const categoryNodes = filteredNavigationNodes?.filter(nn => !nn.topLevelNode);

  const isClusterOverviewSelected = () => {
    const { pathname } = window.location;
    if (pathname.includes('overview') && !pathname.includes('namespaces'))
      return true;
    else return false;
  };

  const setDefaultColumnLayout = () => {
    setLayoutColumn({
      midColumn: null,
      endColumn: null,
      layout: 'OneColumn',
    });
  };

  return (
    <SideNavigation
      collapsed={isSidebarCondensed}
      onSelectionChange={e => e.preventDefault()}
      header={
        <>
          {namespace && (
            <SideNavigation
              style={{
                height: 'auto',
                width: 'auto',
                boxShadow: 'none',
                marginTop: '0.75rem',
              }}
            >
              <SideNavigationItem
                className="hide-shadow"
                icon={'slim-arrow-left'}
                text={'Back To Cluster Details'}
                onClick={() => {
                  handleActionIfFormOpen(
                    isResourceEdited,
                    setIsResourceEdited,
                    isFormOpen,
                    setIsFormOpen,
                    () => {
                      setDefaultColumnLayout();
                      return navigate(clusterUrl(`overview`));
                    },
                  );
                }}
                selected={isClusterOverviewSelected()}
              />
            </SideNavigation>
          )}
          {(!namespace || isSidebarCondensed) && <div className="space-top" />}
          <div style={namespace ? { zIndex: '0' } : { display: 'none' }}>
            <Label
              for="NamespaceComboBox"
              style={{
                ...spacing.sapUiTinyMarginBottom,
                ...spacing.sapUiSmallMarginBegin,
              }}
            >
              {t('common.headers.namespaces')}
            </Label>
            <FlexBox
              alignItems="Center"
              style={{
                ...spacing.sapUiSmallMarginBottom,
                ...spacing.sapUiTinyMarginBeginEnd,
              }}
            >
              <ComboBox
                id="NamespaceComboBox"
                className="combobox-with-dimension-icon"
                onSelectionChange={e => {
                  handleActionIfFormOpen(
                    isResourceEdited,
                    setIsResourceEdited,
                    isFormOpen,
                    setIsFormOpen,
                    () => {
                      setDefaultColumnLayout();
                      return e.target.value === t('navigation.all-namespaces')
                        ? navigate(
                            namespaceUrl(resourceType, {
                              namespace: '-all-',
                            }),
                          )
                        : navigate(
                            namespaceUrl(resourceType, {
                              namespace: e.target.value ?? undefined,
                            }),
                          );
                    },
                  );
                }}
                value={getNamespaceLabel()}
              >
                {NamespaceDropdown()}
              </ComboBox>
            </FlexBox>
          </div>
        </>
      }
    >
      {isSidebarCondensed && (
        <>
          <SideNavigationItem className="space-top disable-effects" />
          <SideNavigationItem
            icon={namespace ? 'slim-arrow-left' : 'bbyd-dashboard'}
            text={namespace ? 'Back To Cluster Details' : 'Cluster Details'}
            onClick={() => {
              handleActionIfFormOpen(
                isResourceEdited,
                setIsResourceEdited,
                isFormOpen,
                setIsFormOpen,
                () => navigate(clusterUrl(`overview`)),
              );
            }}
            selected={isClusterOverviewSelected()}
          />
          {namespace && (
            <SideNavigationItem
              icon={'dimension'}
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
          className="hide-shadow"
          icon={'bbyd-dashboard'}
          text={'Cluster Details'}
          onClick={() => {
            handleActionIfFormOpen(
              isResourceEdited,
              setIsResourceEdited,
              isFormOpen,
              setIsFormOpen,
              () => {
                setDefaultColumnLayout();
                return navigate(clusterUrl(`overview`));
              },
            );
          }}
          selected={isClusterOverviewSelected()}
        />
      )}
      {topLevelNodes.map(node =>
        node.items?.map((item, index) => <NavItem node={item} key={index} />),
      )}
      {categoryNodes.map((category, index) => (
        <CategoryItem
          category={category}
          key={index}
          expandedCategories={expandedCategories}
          handleExpandedCategories={setExpandedCategories}
        />
      ))}
    </SideNavigation>
  );
}
