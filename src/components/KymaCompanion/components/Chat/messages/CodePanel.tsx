import {
  Text,
  Panel,
  Title,
  Icon,
  FlexBox,
  Button,
} from '@ui5/webcomponents-react';
import {
  Segment,
  formatCodeSegment,
} from 'components/KymaCompanion/utils/formatMarkdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  isCurrentThemeDark,
  Theme,
  themeState,
} from 'state/preferences/themeAtom';
import copyToCliboard from 'copy-to-clipboard';
import './CodePanel.scss';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { clusterState } from 'state/clusterAtom';
import jsyaml from 'js-yaml';
import pluralize from 'pluralize';

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
  segment: CodeSegment;
}

export default function CodePanel({
  segment,
}: CodePanelProps | Segment): JSX.Element {
  const theme = useRecoilValue(themeState);
  const syntaxTheme = getCustomTheme(theme);
  const { language, code } = formatCodeSegment(segment?.content ?? segment);
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cluster = useRecoilValue(clusterState);

  const createUrl = (namespace, resType, type, resName) => {
    const basePath = `/cluster/${cluster?.contextName}`;
    const resourcePath = `${
      namespace ? `/namespaces/${namespace}` : ''
    }/${pluralize(resType).toLowerCase()}${resName ? '/' + resName : ''}`;

    const params = new URLSearchParams();
    if (layoutState.layout !== 'OneColumn') {
      params.set('layout', layoutState.layout);
    }
    if (type === 'Update') {
      params.set('showEdit', 'true');
    } else {
      params.set('showCreate', 'true');
    }

    return `${basePath}${resourcePath}?${params}`;
  };

  const handleSetupInEditor = (url, resource, type) => {
    const parts = url.split('/').slice(1); // Remove the leading empty string from split
    let [namespace, resType, resName] = [null, '', ''];
    const parsedResource = jsyaml.load(resource.replace('yaml', '')) as
      | object
      | null;

    if (parts[0] === 'namespaces') {
      [namespace, resType, resName] = [parts[1], parts[2], parts[3]];

      setLayoutColumn({
        ...layoutState,
        layout: 'TwoColumnsMidExpanded',
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
              }
            : null,
      });
    } else {
      [resType, resName] = [parts[0], parts[1]];
    }

    navigate(createUrl(namespace, resType, type, resName));
  };

  return !language ? (
    <div className="code-response sap-margin-y-small">
      <Icon
        id="copy-icon"
        mode="Interactive"
        name="copy"
        design="Information"
        onClick={() => copyToCliboard(code)}
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
          <Button
            design="Transparent"
            icon="copy"
            onClick={() => copyToCliboard(code)}
          >
            Copy
          </Button>
          {segment?.type === 'codeWithAction' && (
            <Button
              design="Transparent"
              icon="sys-add"
              onClick={() =>
                handleSetupInEditor(
                  segment?.link?.address,
                  segment?.content,
                  segment?.link?.actionType,
                )
              }
            >
              {segment?.link?.name}
            </Button>
          )}
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
