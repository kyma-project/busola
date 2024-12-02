export type Segment =
  | { type: 'bold'; content: string }
  | { type: 'code'; content: string }
  | { type: 'highlighted'; content: string }
  | { type: 'link'; content: { name: string; address: string } }
  | { type: 'normal'; content: string };

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
      } else if (segment.startsWith('[') && segment.endsWith(')')) {
        const nameMatch = segment.match(/\[(.*?)\]/);
        const addressMatch = segment.match(/\((.*?)\)/);
        return {
          type: 'link',
          content: {
            name: nameMatch ? nameMatch[1] : '',
            address: addressMatch ? addressMatch[1] : '',
          },
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
