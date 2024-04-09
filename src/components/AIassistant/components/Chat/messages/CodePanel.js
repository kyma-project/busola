import { Text, Panel } from '@ui5/webcomponents-react';
import { formatCodeSegment } from 'components/AIassistant/utils/formatMarkdown';
import './CodePanel.scss';

export default function CodePanel({ text }) {
  const { language, code } = formatCodeSegment(text);
  return !language ? (
    <div className="code-response">
      <Text className="text" renderWhitespace>
        {code}
      </Text>
    </div>
  ) : (
    <Panel headerText={language} className="code-panel" fixed>
      <Text className="text" renderWhitespace>
        {code}
      </Text>
    </Panel>
  );
}
