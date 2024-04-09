export function segmentMarkdownText(text) {
  if (!text) return [];
  const regex = /(\*\*(.*?)\*\*)|(```([\s\S]*?)```\s)|(`(.*?)`)|[^*`]+/g;
  return text.match(regex).map(segment => {
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
  });
}

export function formatCodeSegment(text) {
  const lines = text.split('\n');
  const language = lines.shift();
  const nonEmptyLines = lines.filter(line => line.trim() !== '');
  const code = nonEmptyLines.join('\n');
  return { language, code };
}
