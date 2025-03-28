import { FlexBox, Icon, Panel, Text, Title } from '@ui5/webcomponents-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useRecoilValue } from 'recoil';
import {
  isCurrentThemeDark,
  Theme,
  themeState,
} from 'state/preferences/themeAtom';
import copyToCliboard from 'copy-to-clipboard';
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

function formatCodeSegment(
  text: string,
): { language: string | undefined; code: string } {
  const lines = text.split('\n');
  const language = lines.shift();
  const nonEmptyLines = lines.filter(line => line.trim() !== '');
  const code = nonEmptyLines.join('\n');
  return { language, code };
}

interface CodePanelProps {
  text: string;
  lang?: string;
}

export default function CodePanel({ text, lang }: CodePanelProps): JSX.Element {
  const theme = useRecoilValue(themeState);
  const syntaxTheme = getCustomTheme(theme);
  const { language: inferredLang, code } = formatCodeSegment(text);
  const language = lang ?? inferredLang;
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
          <Icon
            mode="Interactive"
            name="copy"
            design="Information"
            onClick={() => copyToCliboard(code)}
          />
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
