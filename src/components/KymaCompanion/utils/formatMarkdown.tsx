import { UI5Renderer } from 'components/KymaCompanion/components/Chat/messages/markedExtension';
import Markdown from 'marked-react';
import CodePanel from '../components/Chat/messages/CodePanel';

export interface CodeSegmentLink {
  address: string;
  actionType: string;
  name: string;
}

interface YamlBlock {
  codeWithAction: true;
  content: string;
  link: CodeSegmentLink;
}

export interface MarkdownText {
  codeWithAction: false;
  content: string;
}

type MessagePart = YamlBlock | MarkdownText;

export function formatCodeSegment(text: string) {
  const [language, ...lines] = text.split('\n');
  return { language, code: lines.filter(line => line.trim()).join('\n') };
}

function extractYamlContent(block: string): string {
  return block.match(/```([\s\S]*?)```/)?.[1]?.trim() || '';
}

function extractLink(block: string): CodeSegmentLink | null {
  const match = block.match(
    /<div class="link" link-type="(.*?)">\s*\[(.*?)\]\((.*?)\)\s*<\/div>/,
  );
  return match
    ? {
        name: match[2].trim(),
        address: match[3].trim(),
        actionType: match[1].trim(),
      }
    : null;
}

function findClosingDiv(lines: string[], startIndex: number): number {
  let openDivs = 0;
  for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].includes('<div')) openDivs++;
    if (lines[i].includes('</div>') && --openDivs === 0) return i;
  }
  return -1;
}

function extractYamlBlocks(text: string) {
  const lines = text.split('\n');
  const yamlMatches: YamlBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    if (lines[i].includes('<div class="yaml-block')) {
      const start = i;
      const end = findClosingDiv(lines, start);
      if (end === -1) break;

      const block = lines.slice(start, end + 1).join('\n');
      const content = extractYamlContent(block);
      const link = extractLink(block);
      if (!link) break;

      yamlMatches.push({ codeWithAction: true, content, link });
      lines.splice(
        start,
        end - start + 1,
        `[YAML_PLACEHOLDER_${yamlMatches.length - 1}]`,
      );
      i = start + 1;
    } else {
      i++;
    }
  }

  return { text: lines.join('\n'), yamlMatches };
}

function getLanguage(text: string): string {
  const lines = text.split('\n');
  const language = lines.shift();
  return language ?? '';
}

function parseMessage(text: string): MessagePart[] {
  const parts: MessagePart[] = [];
  const { text: updatedText, yamlMatches } = extractYamlBlocks(text);
  let currentText = '';

  updatedText.split('\n').forEach(line => {
    const match = line.match(/YAML_PLACEHOLDER_(\d+)/);
    if (match) {
      if (currentText) {
        parts.push({ codeWithAction: false, content: currentText });
      }
      currentText = '';
      parts.push(yamlMatches[parseInt(match[1], 10)]);
    } else {
      currentText += (currentText ? '\n' : '') + line;
    }
  });

  if (currentText) parts.push({ codeWithAction: false, content: currentText });
  return parts;
}

export function formatMessage(text: string): JSX.Element[] {
  return parseMessage(text).map((part, index) =>
    part.codeWithAction ? (
      <CodePanel
        key={`yaml-${index}`}
        withAction
        code={part.content}
        link={part.link}
        language={getLanguage(part.content)}
      />
    ) : (
      <div key={`msg-${index}`}>
        <Markdown renderer={UI5Renderer}>{part.content}</Markdown>
      </div>
    ),
  );
}
