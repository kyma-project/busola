import { Text, Panel } from '@ui5/webcomponents-react';
import './CodePanel.scss';

interface CodePanelProps {
  text: string;
}

export default function CodePanel({ text }: CodePanelProps): JSX.Element {
  const { language, code } = { language: '', code: '' };
  // TODO: uncomment when utils changes are added
  //const { language, code } = formatCodeSegment(text);
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
