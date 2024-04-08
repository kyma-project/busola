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
  const nonEmptyLines = lines.filter(line => line.trim() !== '');
  const code = nonEmptyLines.join('\n');
  return { language, code };
}
