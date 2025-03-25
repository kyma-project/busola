export type Segment =
  | { type: 'bold'; content: string }
  | { type: 'code'; content: string }
  | { type: 'highlighted'; content: string }
  | { type: 'normal'; content: string }
  | {
      type: 'codeWithAction';
      content: string;
      link: { name: string; type: string; address: string };
    };

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

export function handleResponseFormatting(text: string) {
  if (!text) return [];

  let formattedContent: Segment[] = [];

  // Step 1: Extract YAML blocks & links
  const yamlMatches: { content: string; link: string }[] = [];
  text = text.replace(
    /<div class="yaml-block>\s*<div class="yaml">\s*```([\s\S]*?)\n```\s*<\/div>\s*<div class="link" link-type="(.*?)">\s*\[(.*?)\]\((.*?)\)\s*<\/div>\s*<\/div>/g,
    (_, yamlContent, yamlLinkType, yamlLinkName, yamlLinkUrl) => {
      yamlMatches.push({
        content: yamlContent.trim(),
        link: { name: yamlLinkName, address: yamlLinkUrl, type: yamlLinkType },
      });
      return `[YAML_PLACEHOLDER_${yamlMatches.length - 1}]`; // Placeholder for reinsertion
    },
  );

  formattedContent = formattedContent.concat(segmentMarkdownText(text));

  // Step 3: Reinsert YAML blocks at their placeholders
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
