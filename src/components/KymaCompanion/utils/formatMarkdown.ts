export interface CodeSegmentLink {
  address: string;
  actionType: string;
  name: string;
}
export interface CodeSegment {
  content: string;
  type: 'codeWithAction' | 'code';
  link: CodeSegmentLink;
}
export type Segment =
  | { type: 'bold'; content: string }
  | { type: 'code'; content: string }
  | { type: 'highlighted'; content: string }
  | { type: 'normal'; content: string }
  | CodeSegment;

export function segmentMarkdownText(text: string): Segment[] {
  if (!text) return [];
  const regex = /(\*\*(.*?)\*\*)|(```([\s\S]*?)```\s)|(`(.*?)`)|\[(.*?)\]\((.*?)\)|[^[\]*`]+/g;
  return (
    text.match(regex)?.map(segment => {
      if (segment.startsWith('**')) {
        return {
          type: 'bold',
          content: segment.replace(/\*\*/g, ''),
        };
      } else if (segment.startsWith('```')) {
        return {
          type: 'code',
          content: segment.replace(/```/g, ''),
        };
      } else if (segment.startsWith('`')) {
        return {
          type: 'highlighted',
          content: segment.replace(/`/g, ''),
        };
      } else {
        return {
          type: 'normal',
          content: segment,
        };
      }
    }) ?? []
  );
}

export function formatCodeSegment(
  text: string,
): { language: string | undefined; code: string } {
  const lines = text.split('\n');
  const language = lines.shift();
  const nonEmptyLines = lines.filter(line => line.trim() !== '');
  const code = nonEmptyLines.join('\n');
  return { language, code };
}

function extractYamlBlocks(text: string) {
  const yamlMatches = [];

  function findClosingDiv(text: string, startIndex: number) {
    let openDivs = 0;
    let i = startIndex;
    while (i < text.length) {
      if (text.startsWith('<div', i)) openDivs++;
      if (text.startsWith('</div>', i)) {
        openDivs--;
        if (openDivs === 0) return i + 6; // End of matching closing div
      }
      i++;
    }
    return -1;
  }

  while (true) {
    const blockStart = text.indexOf('<div class="yaml-block');
    if (blockStart === -1) break;

    const blockEnd = findClosingDiv(text, blockStart);
    if (blockEnd === -1) break;

    const block = text.substring(blockStart, blockEnd);

    const yamlStart = block.indexOf('```') + 3;
    const yamlEnd = block.indexOf('```', yamlStart);
    if (yamlStart === -1 || yamlEnd === -1) break;
    const yamlContent = block.substring(yamlStart, yamlEnd).trim();

    const linkMatch = block.match(
      /<div class="link" link-type="(.*?)">\s*\[(.*?)\]\((.*?)\)\s*<\/div>/,
    );

    if (!linkMatch) break;

    yamlMatches.push({
      content: yamlContent,
      link: {
        name: linkMatch[2].trim(),
        address: linkMatch[3].trim(),
        actionType: linkMatch[1].trim(),
      },
    });

    text =
      text.substring(0, blockStart) +
      `[YAML_PLACEHOLDER_${yamlMatches.length - 1}]` +
      text.substring(blockEnd);
  }

  return { text, yamlMatches };
}

export function handleResponseFormatting(text: string) {
  if (!text) return [];

  let formattedContent: Segment[] = [];
  const { text: updatedText, yamlMatches } = extractYamlBlocks(text);

  formattedContent = formattedContent.concat(segmentMarkdownText(updatedText));

  for (let i = 0; i < formattedContent.length; i++) {
    const match = formattedContent[i].content.match(/YAML_PLACEHOLDER_(\d+)/);
    if (match) {
      const yamlIndex = parseInt(match[1], 10);
      formattedContent[i] = {
        type: 'codeWithAction',
        content: yamlMatches[yamlIndex].content,
        link: yamlMatches[yamlIndex].link,
      };
    }
  }

  return formattedContent;
}
