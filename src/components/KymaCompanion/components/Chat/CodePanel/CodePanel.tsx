import { Text, Panel, Title, FlexBox, Button } from '@ui5/webcomponents-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  isCurrentThemeDark,
  Theme,
  themeAtom,
} from 'state/preferences/themeAtom';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { useNavigate } from 'react-router';
import { clusterAtom } from 'state/clusterAtom';
import pluralize from 'pluralize';
import { CodeSegmentLink } from 'components/KymaCompanion/utils/formatMarkdown';

import { registerIcon } from '@ui5/webcomponents-base/dist/asset-registries/Icons.js';
import { registerIconCollectionForTheme } from '@ui5/webcomponents-base/dist/asset-registries/util/IconCollectionsByTheme.js';

import './CodePanel.scss';
import CopyButton from 'shared/components/CopyButton/CopyButton';
import {
  parseParams,
  useDoesNamespaceExist,
  useDoesResourceExist,
} from '../chatHelper';

// Register icon for replace action
registerIcon('replace', {
  packageName: 'fpa-icons-package',
  collection: 'fpa-icons-sap-horizon',
  pathData:
    'M0,38.41C0,17.2,17.19,0,38.4,0h166.49c21.21,0,38.4,17.19,38.4,38.4v166.49c0,21.21-17.19,38.4-38.4,38.4H38.4c-21.21,0-38.4-17.19-38.4-38.4V38.41ZM51.2,51.21v140.89h140.89V51.21H51.2ZM307.1,268.71c-21.21,0-38.4,17.19-38.4,38.4v166.49c0,21.21,17.19,38.4,38.4,38.4h166.49c21.21,0,38.4-17.19,38.4-38.4v-166.49c0-21.21-17.19-38.4-38.4-38.4h-166.49ZM371.9.43h1.76v.08c22.24,1.24,41.35,9.85,57.34,25.84,18,17.33,27,38.67,27,64v47l10-11c5.33-5.33,11.33-8,18-8,7.33,0,13.66,2.67,19,8,4.67,6,7,12,7,18,0,7.33-2.67,13.33-8,18l-54,55c-4.67,4.67-10.67,7-18,7-6.67,0-12.67-2.67-18-8l-54-54c-5.33-4.67-8-10.67-8-18s2.33-13.67,7-19c5.33-4.67,11.67-7,19-7,6.67,0,12.67,2.67,18,8l10,11v-47c0-11.33-3.67-20.67-11-28-6.16-6.16-13.49-9.73-22-10.72l-59.82-.43c-14.14-.1-25.52-11.65-25.41-25.78.1-14.14,11.65-25.52,25.78-25.41l54.44.39v-.05c1.31,0,2.61.02,3.9.07ZM62,294.65c4.67-4.67,10.67-7,18-7,6.67,0,12.67,2.67,18,8l54,54c5.33,4.67,8,10.67,8,18s-2.33,13.66-7,19c-5.33,4.67-11.67,7-19,7-6.67,0-12.67-2.67-18-8l-10-11v47c0,11.33,3.67,20.67,11,28,6.16,6.16,13.49,9.73,22,10.72l59.81.43c14.14.1,25.52,11.65,25.41,25.78-.1,14.14-11.65,25.52-25.78,25.41l-54.44-.4v.05c-1.31,0-2.61-.03-3.9-.07h-1.76s0-.08,0-.08c-22.23-1.24-41.35-9.85-57.34-25.84-18-17.33-27-38.67-27-64v-47l-10,11c-5.33,5.33-11.33,8-18,8-7.33,0-13.67-2.67-19-8C2.34,379.65,0,373.65,0,367.65c0-7.33,2.67-13.33,8-18l54-55Z',
  viewBox: '0 0 512 512',
});
registerIconCollectionForTheme('fpa-icons', {
  sap_horizon: 'fpa-icons-sap-horizon',
});

function getCustomTheme(theme: Theme) {
  const isDark = isCurrentThemeDark(theme);
  const monacoEditorKeyColorLight = '#008080';
  const monacoEditorKeyColorDark = '#3dc9b0';
  const monacoEditorTextColorLight = '#0451a5';
  const monacoEditorTextColorDark = '#ce9178';

  return {
    'code[class*="language-"]': {
      color: isDark ? monacoEditorTextColorDark : monacoEditorTextColorLight,
      background: 'var(--sapBaseColor)',
      fontFamily: 'var(--sapFontFamily)',
      fontSize: '14px',
    },
    'pre[class*="language-"]': {
      background: 'var(--sapBaseColor)',
      padding: '0 0.75rem 0.75rem',
      marginTop: '0.5rem',
      marginBottom: '0',
      borderRadius: '8px',
    },
    comment: {
      color: isDark ? 'var(--sapLinkColor)' : monacoEditorTextColorDark,
    },
    keyword: {
      color: isDark ? monacoEditorKeyColorDark : monacoEditorKeyColorLight,
    },
    key: {
      color: isDark ? monacoEditorKeyColorDark : monacoEditorKeyColorLight,
    },
    punctuation: {
      color: 'var(--sapTextColor)',
    },
    operator: { color: 'var(--sapTextColor)' },
    function: { color: 'var(--sapChart_OrderedColor_4)' },
    number: {
      color: 'var(--sapChart_OrderedColor_4)',
    },
  };
}

interface CodePanelProps {
  code: string;
  language: string;
  withAction?: boolean;
  link?: CodeSegmentLink | null;
  fetchFn?: (_: string) => boolean;
}

export default function CodePanel({
  code,
  language,
  withAction,
  link,
  fetchFn,
}: CodePanelProps): JSX.Element {
  const { t } = useTranslation();
  const theme = useAtomValue(themeAtom);
  const syntaxTheme = getCustomTheme(theme);
  const [layoutState, setLayoutColumn] = useAtom(columnLayoutAtom);
  const navigate = useNavigate();
  const cluster = useAtomValue(clusterAtom);
  const doesNamespaceExist = useDoesNamespaceExist(
    link?.address ?? '',
    code,
    fetchFn,
  );
  const doesResourceExist = useDoesResourceExist(
    link?.address ?? '',
    code,
    fetchFn,
  );

  const createUrl = (
    namespace: string | null,
    resType: string,
    type: string,
    resName: string,
  ) => {
    const basePath = `/cluster/${cluster?.contextName}`;
    const resourcePath = namespace
      ? `/namespaces/${namespace}/${pluralize(resType).toLowerCase()}`
      : `/${pluralize(resType).toLowerCase()}`;
    const fullResourcePath = resName
      ? `${resourcePath}/${resName}`
      : resourcePath;

    const params = new URLSearchParams();
    params.set('layout', 'TwoColumnsMidExpanded');
    if (type === 'Update') {
      params.set('showEdit', 'true');
    } else {
      params.set('showCreate', 'true');
    }

    return `${basePath}${fullResourcePath}?${params}`;
  };

  const handlePlaceInEditor = (url: string, resource: string, type: string) => {
    const { namespace, resType, resName, parsedResource } = parseParams(
      url,
      resource,
    );

    setLayoutColumn({
      ...layoutState,
      layout: 'TwoColumnsMidExpanded',
      midColumn: null,
      showCreate: {
        ...layoutState.showCreate,
        resource: parsedResource,
        resourceType: resType,
        namespaceId: namespace,
      },
      showEdit: null,
    });

    navigate(createUrl(namespace, resType, type, resName));
  };

  const handleUpdateInEditor = (
    url: string,
    resource: string,
    type: string,
  ) => {
    const { namespace, resType, resName, parsedResource } = parseParams(
      url,
      resource,
    );

    setLayoutColumn({
      ...layoutState,
      layout: 'TwoColumnsMidExpanded',
      midColumn: {
        resourceType: resType,
        rawResourceTypeName: resType,
        namespaceId: namespace,
        resourceName: resName,
        apiGroup: null,
        apiVersion: null,
      },
      showCreate: null,
      showEdit: {
        ...layoutState.showEdit,
        resource: parsedResource,
        resourceType: resType,
        namespaceId: namespace,
        resourceName: resName,
        apiGroup: null,
        apiVersion: null,
      },
    });

    navigate(createUrl(namespace, resType, type, resName));
  };

  return !language ? (
    <div className="code-response sap-margin-y-small">
      <CopyButton contentToCopy={code} tooltipClassName="copy-icon" />
      <Text id="code-text">{code}</Text>
    </div>
  ) : (
    <Panel
      className="code-panel sap-margin-y-small"
      stickyHeader
      header={
        <FlexBox alignItems="Center" fitContainer justifyContent="SpaceBetween">
          <Title level="H6" size="H6">
            {language.toLocaleUpperCase()}
          </Title>
          <FlexBox justifyContent="End" alignItems="Center">
            <CopyButton
              buttonClassName="action-button"
              contentToCopy={code}
              iconOnly={false}
            />
            {withAction && doesNamespaceExist && link?.actionType === 'New' && (
              <Button
                className="action-button"
                design="Transparent"
                icon="sys-add"
                onClick={() =>
                  handlePlaceInEditor(link.address, code, link.actionType)
                }
                accessibleName={t('common.buttons.place')}
              >
                {t('common.buttons.place')}
              </Button>
            )}
            {withAction &&
              doesNamespaceExist &&
              doesResourceExist &&
              link?.actionType === 'Update' && (
                <Button
                  className="action-button"
                  design="Transparent"
                  icon="fpa-icons/replace"
                  onClick={() =>
                    handleUpdateInEditor(link.address, code, link.actionType)
                  }
                  accessibleName={t('common.buttons.replace')}
                >
                  {t('common.buttons.replace')}
                </Button>
              )}
          </FlexBox>
        </FlexBox>
      }
      fixed
    >
      <SyntaxHighlighter language={language} style={syntaxTheme}>
        {code}
      </SyntaxHighlighter>
    </Panel>
  );
}
