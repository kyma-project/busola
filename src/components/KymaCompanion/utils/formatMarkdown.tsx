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
  link: CodeSegmentLink | null;
  language: string;
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

function extractYamlBlocks(lines: string[], i: number) {
  const start = i;
  const end = findClosingDiv(lines, start);

  const block = lines.slice(start, end + 1).join('\n');
  const content = extractYamlContent(block);
  const link = extractLink(block);

  return { content, link, end };
}

function getLanguage(text: string) {
  const lines = text.split('\n');
  const language = lines.shift();

  return { language: language ?? '', code: lines.join('\n') };
}

function parseMessage(text: string): MessagePart[] {
  const lines = text.split('\n');
  const parts: MessagePart[] = [];
  let currentText = '';
  let i = 0;

  while (i < lines.length) {
    if (lines[i].includes('<div class="yaml-block')) {
      if (currentText) {
        parts.push({ codeWithAction: false, content: currentText });
        currentText = '';
      }
      const { content, link, end } = extractYamlBlocks(lines, i);
      const { code, language } = getLanguage(content);
      parts.push({ codeWithAction: true, content: code, link, language });

      i = end + 1;
    } else {
      if (currentText) {
        currentText += '\n' + lines[i];
      } else {
        currentText = lines[i];
      }
      i++;
    }
  }

  if (currentText) {
    parts.push({ codeWithAction: false, content: currentText });
  }

  return parts;
}

export function formatMessage(text: string, themeClass: string): JSX.Element[] {
  return parseMessage(text).map((part, index) =>
    part.codeWithAction ? (
      <CodePanel
        key={`yaml-${index}`}
        withAction
        language={part.language}
        code={part.content}
        link={part.link}
      />
    ) : (
      <div key={`msg-${index}`} className={themeClass}>
        <Markdown renderer={UI5Renderer}>{part.content}</Markdown>
      </div>
    ),
  );
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
