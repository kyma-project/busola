import {
  Text,
  Panel,
  Title,
  Icon,
  FlexBox,
  Button,
} from '@ui5/webcomponents-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import {
  isCurrentThemeDark,
  Theme,
  themeState,
} from 'state/preferences/themeAtom';
import copyToClipboard from 'copy-to-clipboard';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useNavigate } from 'react-router';
import { clusterState } from 'state/clusterAtom';
import jsyaml from 'js-yaml';
import pluralize from 'pluralize';
import { CodeSegmentLink } from 'components/KymaCompanion/utils/formatMarkdown';
import './CodePanel.scss';

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
      padding: '0 0.75rem',
      margin: '0.5rem 0',
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
}

export default function CodePanel({
  code,
  language,
  withAction,
  link,
}: CodePanelProps): JSX.Element {
  const { t } = useTranslation();
  const theme = useRecoilValue(themeState);
  const syntaxTheme = getCustomTheme(theme);
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const navigate = useNavigate();
  const cluster = useRecoilValue(clusterState);

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

  const handleSetupInEditor = (url: string, resource: string, type: string) => {
    const parts = url.split('/').filter(Boolean); // Remove empty strings from split
    let [namespace, resType, resName]: [string | null, string, string] = [
      null,
      '',
      '',
    ];
    const parsedResource = jsyaml.load(resource.replace('yaml', '')) || {};

    if (parts[0] === 'namespaces') {
      [namespace, resType, resName] = [parts[1], parts[2], parts[3]];
    } else {
      [resType, resName] = [parts[0], parts[1]];
    }

    setLayoutColumn({
      ...layoutState,
      layout: 'TwoColumnsMidExpanded',
      midColumn:
        type === 'Update'
          ? {
              resourceType: resType,
              namespaceId: namespace,
              resourceName: resName,
              apiGroup: null,
              apiVersion: null,
            }
          : null,
      showCreate:
        type === 'New'
          ? {
              ...layoutState.showCreate,
              resource: parsedResource,
              resourceType: resType,
              namespaceId: namespace,
            }
          : null,
      showEdit:
        type === 'Update'
          ? {
              ...layoutState.showEdit,
              resource: parsedResource,
              resourceType: resType,
              namespaceId: namespace,
              resourceName: resName,
              apiGroup: null,
              apiVersion: null,
            }
          : null,
    });

    navigate(createUrl(namespace, resType, type, resName));
  };
  return !language ? (
    <div className="code-response sap-margin-y-small">
      <Icon
        id="copy-icon"
        mode="Interactive"
        name="copy"
        design="Information"
        onClick={() => copyToClipboard(code)}
      />
      <Text id="code-text">{code}</Text>
    </div>
  ) : (
    <Panel
      className="code-panel sap-margin-y-small"
      header={
        <FlexBox alignItems="Center" fitContainer justifyContent="SpaceBetween">
          <Title level="H6" size="H6">
            {language}
          </Title>
          <FlexBox justifyContent="End" alignItems="Center">
            <Button
              className="action-button"
              design="Transparent"
              icon="copy"
              onClick={() => copyToClipboard(code)}
              accessibleName={t('common.buttons.copy')}
            >
              {t('common.buttons.copy')}
            </Button>
            {withAction && link && (
              <Button
                className="action-button"
                design="Transparent"
                icon="sys-add"
                onClick={() =>
                  handleSetupInEditor(link.address, code, link.actionType)
                }
                accessibleName={t('common.buttons.place')}
              >
                {t('common.buttons.place')}
              </Button>
            )}
          </FlexBox>
        </FlexBox>
      }
      fixed
    >
      <SyntaxHighlighter language={language} style={syntaxTheme} wrapLongLines>
        {code}
      </SyntaxHighlighter>
    </Panel>
  );
}
