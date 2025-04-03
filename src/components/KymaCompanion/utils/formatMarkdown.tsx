import { UI5Renderer } from 'components/KymaCompanion/components/Chat/messages/markedExtension';

import Markdown from 'marked-react';

export function formatMessage(text: string, themeClass: string): JSX.Element[] {
  const elements: JSX.Element[] = [];
  let currentText: string = '';
  let divs = 0;
  let idx = 0;
  let codeSection: boolean = false;
  text.split('\n').forEach(line => {
    if (line.trim().startsWith('<div')) {
      divs += 1;
      if (codeSection) {
        return;
      }
      elements.push(MarkdownText(currentText + '\n', idx, themeClass));
      currentText = line + '\n';
      codeSection = true;
      return;
    }

    if (codeSection && line.trim().startsWith('</div>')) {
      divs -= 1;
      currentText += line;
      if (divs === 0) {
        // TODO: Will be implemented in https://github.com/kyma-project/busola/issues/3604
        elements.push(<>{`---\n${currentText}\n---`}</>);
        codeSection = false;
        currentText = '';
      }
      return;
    }
    currentText += line + '\n';
  });

  elements.push(MarkdownText(currentText + '\n', idx, themeClass));

  return elements;
}

function MarkdownText(
  text: string,
  idx: number,
  themeClass: string,
): JSX.Element {
  return (
    <div id={`msg-${idx}`} className={themeClass}>
      <Markdown renderer={UI5Renderer}>{text}</Markdown>
    </div>
  );
}
