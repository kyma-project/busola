import { Text, Panel } from '@ui5/webcomponents-react';
import './CodePanel.scss';

export default function CodePanel({ text }) {
  const { language, code } = parseCodeText(text);
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

function parseCodeText(text) {
  const lines = text.split('\n');
  const language = lines.shift();
  const code = lines.join('\n');
  return { language, code };
}
