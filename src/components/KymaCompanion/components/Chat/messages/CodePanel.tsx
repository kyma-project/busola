import { Text, Panel } from '@ui5/webcomponents-react';
import { formatCodeSegment } from 'components/KymaCompanion/utils/formatMarkdown';
import './CodePanel.scss';

interface CodePanelProps {
  text: string;
}

export default function CodePanel({ text }: CodePanelProps): JSX.Element {
  const { language, code } = formatCodeSegment(text);
  return !language ? (
    <div className="code-response">
      <Text className="text">{code}</Text>
    </div>
  ) : (
    <Panel headerText={language} className="code-panel" fixed>
      <Text className="text">{code}</Text>
    </Panel>
  );
}
